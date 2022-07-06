
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function getQuadrant(row, col) {
      if (row < 4 && col < 4) {
        return 1;
      } else if (row < 4 && col > 3) {
        return 2;
      } else if (row > 3 && col < 4) {
        return 3;
      } else if (row > 3 && col > 3) {
        return 4;
      }
    }

    function getSwap(row, col, currentRow, currentCol) {
      if (Math.abs(row - currentRow) == 1 && col == currentCol) {
        return ["flipVerticalCurrent", "flipVerticalPrevious"];
      } else if (row == currentRow && Math.abs(col - currentCol) == 1) {
        return ["flipHorizontalCurrent", "flipHorizontalPrevious"];
      }
      return "none";
    }

    function setAnimations(currentBoard, row1, col1, row2, col2, quadrant) {
      let idx1 = row1 * 8 + col1;
      let idx2 = row2 * 8 + col2;
      let swap = getSwap(row1, col1, row2, col2);
      currentBoard[idx1].animationDirection = swap[0];
      currentBoard[idx2].animationDirection = swap[1];
      return currentBoard;
    }

    function updateBoard(data, currentBoard) {
      let newBoard = data.board;
      for (let i = 0; i < newBoard.length; i++) {
        currentBoard[i].letter = newBoard[i];
      }

      if (getQuadrant(data.row1, data.col1) != quadrant) {
        currentBoard = setAnimations(currentBoard, data.row1, data.col1, data.row2, data.col2);
      }
      return currentBoard;
    }

    class Square {
      constructor(id, row, col, x, y, quadrant, color, size, letter) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.x = x;
        this.y = y;
        this.quadrant = quadrant;
        this.color = color;
        this.size = size;
        this.letter = letter;
        this.selected = false;
        this.animationDirection = "none";
      }
    }

    function getStartingBoard(quadrant, data) {
      let rows = 8;
      let cols = 8;
      let size = 50;
      let buffer = 8;
      let count = 0;
      let color = "isNotPlayerQuadrant";
      let letters = data["board"];
      let startingBoard = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let letter = letters[count];
          let x = col * (size + buffer);
          let y = row * (size + buffer);
          let currentQuadrant = getQuadrant(row, col);
          if (currentQuadrant == quadrant) {
            color = "isPlayerQuadrant";
          } else {
            color = "isNotPlayerQuadrant";
          }
          let cell = new Square(count, row, col, x, y, currentQuadrant, color, size, letter);
          startingBoard.push(cell);
          count += 1;
        }
      }
      return startingBoard;
    }

    const gameState = writable("disconnected");
    const board = writable("");
    const quadrant$1 = writable(1);
    const gameID = writable("");
    const users = writable(["", "", "", ""]);
    const username = writable("");
    const userIDs = writable([]);
    const userID = writable([]);
    const finalWords = writable([]);
    const finalScore = writable();
    const userCount = writable(0);
    const gameTimerStart = writable();
    const gameTimerProgress = writable();
    const connectionUrl = writable("localhost:3080");

    let socket = null;

    function setGameState(value) {
      gameState.set(value);
    }

    function setUsersLocations(data) {
      let orderedUsers = [];
      let existingUsers = data["users"];
      let quads = data["quadrants"];
      let ids = data["user_ids"];

      for (let i = 0; i < existingUsers.length; i++) {
        orderedUsers[quads[i] - 1] = existingUsers[i];
        if (ids[i] == get_store_value(userID)) {
          quadrant$1.set(quads[i]);
        }
      }
      users.set(orderedUsers);
      userIDs.set(data["user_ids"]);
    }

    async function runTimer() {
      let elapsed = performance.now() - get_store_value(gameTimerStart);
      gameTimerProgress.set((elapsed / 1000 / 90.5) * 100);
    }

    function startGame(op, data) {
      setUsersLocations(data);
      gameID.set(data["game_id"]);
      let startingBoard = getStartingBoard(get_store_value(quadrant$1), data);
      board.set(startingBoard);
      gameState.set(op);
      gameTimerStart.set(performance.now());
      setInterval(runTimer, 200);
    }

    function selectCell(data) {
      let row = data.row;
      let col = data.col;
      let id = row * 8 + col;
      let selectedQuadrant = getQuadrant(row, col);
      if (selectedQuadrant == get_store_value(quadrant$1)) {
        return;
      }
      let tempBoard = get_store_value(board);
      for (let i = 0; i < tempBoard.length; i++) {
        if (tempBoard[i].quadrant == selectedQuadrant) {
          tempBoard[i].selected = false;
        }
      }
      tempBoard[id].selected = true;
      board.set(tempBoard);
    }

    function finishGame(op, data) {
      let wordsByLength = [[], [], [], [], [], []];
      data["words"].forEach(function (word) {
        wordsByLength[8 - word.length].push(word);
      });
      finalWords.set(wordsByLength);
      finalScore.set(data["score"]);
      gameState.set(op);
    }

    function connectServer() {
      let connectString = "ws://" + get_store_value(connectionUrl) + `/connect?user=${get_store_value(username)}`;
      // let connectString = "wss://" + get(connectionUrl) + `/connect?user=${get(username)}`;
      socket = new WebSocket(connectString);

      socket.addEventListener("open", function (event) {
        gameState.set("waiting");
      });

      socket.addEventListener("message", function (event) {
        let msg = JSON.parse(event.data);
        if ("op" in msg) {
          let op = msg.op;
          let data = msg.data;

          switch (op) {
            case "abort-game":
              gameState.set("abort-game");
              break;
            case "finish-game":
              finishGame(op, data);
              break;
            case "select":
              selectCell(data);
              break;
            case "start-countdown":
              gameState.set("start-countdown");
              break;
            case "start-game":
              startGame(op, data);
              break;
            case "update-board-on-swap":
              board.set(updateBoard(data, get_store_value(board), get_store_value(quadrant$1)));
              break;
            case "user-count":
              userCount.set(data["count"]);
              break;
            case "user-join":
              userID.set(data["user_id"]);
              break;
          }
        }
      });
    }

    const sendMessage = message => {
      if (socket.readyState <= 1) {
        socket.send(message);
      }
    };

    /* src/Play/Finish.svelte generated by Svelte v3.48.0 */
    const file$9 = "src/Play/Finish.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (15:4) {#if wordSet.length > 0}
    function create_if_block$5(ctx) {
    	let div2;
    	let div0;
    	let t0_value = 8 - /*i*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let div1;
    	let each_value_1 = /*wordSet*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "count-header svelte-1dn4684");
    			set_style(div0, "background-color", /*countHeaderColors*/ ctx[3][/*i*/ ctx[7]]);
    			add_location(div0, file$9, 16, 8, 445);
    			attr_dev(div1, "class", "words-container svelte-1dn4684");
    			add_location(div1, file$9, 17, 8, 541);
    			attr_dev(div2, "class", "outer-container svelte-1dn4684");
    			add_location(div2, file$9, 15, 6, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*words*/ 2) {
    				each_value_1 = /*wordSet*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(15:4) {#if wordSet.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (19:10) {#each wordSet as word}
    function create_each_block_1(ctx) {
    	let div;
    	let t_value = /*word*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "word svelte-1dn4684");
    			add_location(div, file$9, 19, 12, 617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*words*/ 2 && t_value !== (t_value = /*word*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(19:10) {#each wordSet as word}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#each words as wordSet, i}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*wordSet*/ ctx[5].length > 0 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*wordSet*/ ctx[5].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(14:2) {#each words as wordSet, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let hr0;
    	let t3;
    	let t4;
    	let hr1;
    	let t5;
    	let div1;
    	let t6;
    	let span;
    	let t7;
    	let div2_class_value;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*words*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Words found";
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			hr1 = element("hr");
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Score: ");
    			span = element("span");
    			t7 = text(/*score*/ ctx[2]);
    			t8 = space();
    			button = element("button");
    			button.textContent = "Again?";
    			attr_dev(img, "class", "logo");
    			if (!src_url_equal(img.src, img_src_value = "./images/logo_new.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "log");
    			add_location(img, file$9, 9, 0, 216);
    			attr_dev(div0, "class", "title svelte-1dn4684");
    			add_location(div0, file$9, 11, 2, 296);
    			attr_dev(hr0, "class", "svelte-1dn4684");
    			add_location(hr0, file$9, 12, 2, 335);
    			attr_dev(hr1, "class", "svelte-1dn4684");
    			add_location(hr1, file$9, 25, 2, 716);
    			attr_dev(span, "class", "color-num svelte-1dn4684");
    			add_location(span, file$9, 26, 28, 751);
    			attr_dev(div1, "class", "score svelte-1dn4684");
    			add_location(div1, file$9, 26, 2, 725);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-1dn4684"));
    			add_location(div2, file$9, 10, 0, 275);
    			attr_dev(button, "class", "svelte-1dn4684");
    			add_location(button, file$9, 29, 0, 804);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, hr0);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, hr1);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, t6);
    			append_dev(div1, span);
    			append_dev(span, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[4]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*words, countHeaderColors*/ 10) {
    				each_value = /*words*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*score*/ 4) set_data_dev(t7, /*score*/ ctx[2]);

    			if (dirty & /*size*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-1dn4684"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Finish', slots, []);
    	let { size } = $$props;
    	let { words } = $$props;
    	let { score } = $$props;
    	let countHeaderColors = ["#ff007f", "#55ff44", "#08e8de", "#ffaa1d", "#1974d2", "#44ca77"];
    	const writable_props = ['size', 'words', 'score'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Finish> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setGameState("disconnected");

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('words' in $$props) $$invalidate(1, words = $$props.words);
    		if ('score' in $$props) $$invalidate(2, score = $$props.score);
    	};

    	$$self.$capture_state = () => ({
    		setGameState,
    		size,
    		words,
    		score,
    		countHeaderColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('words' in $$props) $$invalidate(1, words = $$props.words);
    		if ('score' in $$props) $$invalidate(2, score = $$props.score);
    		if ('countHeaderColors' in $$props) $$invalidate(3, countHeaderColors = $$props.countHeaderColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, words, score, countHeaderColors, click_handler];
    }

    class Finish extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { size: 0, words: 1, score: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Finish",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console.warn("<Finish> was created without expected prop 'size'");
    		}

    		if (/*words*/ ctx[1] === undefined && !('words' in props)) {
    			console.warn("<Finish> was created without expected prop 'words'");
    		}

    		if (/*score*/ ctx[2] === undefined && !('score' in props)) {
    			console.warn("<Finish> was created without expected prop 'score'");
    		}
    	}

    	get size() {
    		throw new Error("<Finish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Finish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get words() {
    		throw new Error("<Finish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set words(value) {
    		throw new Error("<Finish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get score() {
    		throw new Error("<Finish>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set score(value) {
    		throw new Error("<Finish>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Scoreboard/WinnerListing.svelte generated by Svelte v3.48.0 */

    const file$8 = "src/Scoreboard/WinnerListing.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (22:4) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*day*/ ctx[1].score + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = text("\n        (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(img, "class", "score-img svelte-vqup6r");
    			if (!src_url_equal(img.src, img_src_value = "images/runner.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "third place");
    			attr_dev(img, "width", "40px");
    			add_location(img, file$8, 23, 8, 656);
    			attr_dev(div, "class", "score svelte-vqup6r");
    			add_location(div, file$8, 22, 6, 628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*day*/ ctx[1].score + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(22:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:21) 
    function create_if_block_2$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*day*/ ctx[1].score + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = text("\n        (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(img, "class", "score-img svelte-vqup6r");
    			if (!src_url_equal(img.src, img_src_value = "images/third.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "third place");
    			attr_dev(img, "width", "40px");
    			add_location(img, file$8, 18, 8, 495);
    			attr_dev(div, "class", "score svelte-vqup6r");
    			add_location(div, file$8, 17, 6, 467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*day*/ ctx[1].score + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(17:21) ",
    		ctx
    	});

    	return block;
    }

    // (12:21) 
    function create_if_block_1$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*day*/ ctx[1].score + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = text("\n        (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(img, "class", "score-img svelte-vqup6r");
    			if (!src_url_equal(img.src, img_src_value = "images/second.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "second place");
    			attr_dev(img, "width", "40px");
    			add_location(img, file$8, 13, 8, 322);
    			attr_dev(div, "class", "score svelte-vqup6r");
    			add_location(div, file$8, 12, 6, 294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*day*/ ctx[1].score + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(12:21) ",
    		ctx
    	});

    	return block;
    }

    // (7:4) {#if i == 0}
    function create_if_block$4(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*day*/ ctx[1].score + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = text("\n        (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(img, "class", "score-img svelte-vqup6r");
    			if (!src_url_equal(img.src, img_src_value = "images/first.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "first place");
    			attr_dev(img, "width", "40px");
    			add_location(img, file$8, 8, 8, 151);
    			attr_dev(div, "class", "score svelte-vqup6r");
    			add_location(div, file$8, 7, 6, 123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*day*/ ctx[1].score + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(7:4) {#if i == 0}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#each listing as day, i}
    function create_each_block$1(ctx) {
    	let div5;
    	let t0;
    	let div4;
    	let div0;
    	let t1_value = /*day*/ ctx[1].player1 + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*day*/ ctx[1].player2 + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5_value = /*day*/ ctx[1].player3 + "";
    	let t5;
    	let t6;
    	let div3;
    	let t7_value = /*day*/ ctx[1].player4 + "";
    	let t7;
    	let t8;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[3] == 0) return create_if_block$4;
    		if (/*i*/ ctx[3] == 1) return create_if_block_1$3;
    		if (/*i*/ ctx[3] == 2) return create_if_block_2$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			if_block.c();
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			attr_dev(div0, "class", "player svelte-vqup6r");
    			add_location(div0, file$8, 29, 6, 825);
    			attr_dev(div1, "class", "player svelte-vqup6r");
    			add_location(div1, file$8, 30, 6, 871);
    			attr_dev(div2, "class", "player svelte-vqup6r");
    			add_location(div2, file$8, 31, 6, 917);
    			attr_dev(div3, "class", "player svelte-vqup6r");
    			add_location(div3, file$8, 32, 6, 963);
    			attr_dev(div4, "class", "players-container svelte-vqup6r");
    			add_location(div4, file$8, 28, 4, 787);
    			attr_dev(div5, "class", "outer-container svelte-vqup6r");
    			add_location(div5, file$8, 5, 2, 70);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			if_block.m(div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div2, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, t7);
    			append_dev(div5, t8);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    			if (dirty & /*listing*/ 1 && t1_value !== (t1_value = /*day*/ ctx[1].player1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*listing*/ 1 && t3_value !== (t3_value = /*day*/ ctx[1].player2 + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*listing*/ 1 && t5_value !== (t5_value = /*day*/ ctx[1].player3 + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*listing*/ 1 && t7_value !== (t7_value = /*day*/ ctx[1].player4 + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(5:0) {#each listing as day, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*listing*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*listing*/ 1) {
    				each_value = /*listing*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WinnerListing', slots, []);
    	let { listing } = $$props;
    	const writable_props = ['listing'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WinnerListing> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('listing' in $$props) $$invalidate(0, listing = $$props.listing);
    	};

    	$$self.$capture_state = () => ({ listing });

    	$$self.$inject_state = $$props => {
    		if ('listing' in $$props) $$invalidate(0, listing = $$props.listing);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [listing];
    }

    class WinnerListing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { listing: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WinnerListing",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*listing*/ ctx[0] === undefined && !('listing' in props)) {
    			console.warn("<WinnerListing> was created without expected prop 'listing'");
    		}
    	}

    	get listing() {
    		throw new Error("<WinnerListing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listing(value) {
    		throw new Error("<WinnerListing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Scoreboard/Winners.svelte generated by Svelte v3.48.0 */

    const { Error: Error_1 } = globals;
    const file$7 = "src/Scoreboard/Winners.svelte";

    // (34:2) {:else}
    function create_else_block(ctx) {
    	let winnerlisting;
    	let current;

    	winnerlisting = new WinnerListing({
    			props: { listing: /*today*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(winnerlisting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(winnerlisting, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const winnerlisting_changes = {};
    			if (dirty & /*today*/ 2) winnerlisting_changes.listing = /*today*/ ctx[1];
    			winnerlisting.$set(winnerlisting_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(winnerlisting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(winnerlisting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(winnerlisting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(34:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#if today.length < 0}
    function create_if_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No winners yet today!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(32:2) {#if today.length < 0}",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if yesterday.length > 0}
    function create_if_block$3(ctx) {
    	let hr;
    	let t0;
    	let div;
    	let t2;
    	let winnerlisting;
    	let current;

    	winnerlisting = new WinnerListing({
    			props: { listing: /*yesterday*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			div = element("div");
    			div.textContent = "Yesterday's leaders";
    			t2 = space();
    			create_component(winnerlisting.$$.fragment);
    			add_location(hr, file$7, 37, 4, 976);
    			attr_dev(div, "class", "title svelte-usln9f");
    			add_location(div, file$7, 38, 4, 987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(winnerlisting, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const winnerlisting_changes = {};
    			if (dirty & /*yesterday*/ 4) winnerlisting_changes.listing = /*yesterday*/ ctx[2];
    			winnerlisting.$set(winnerlisting_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(winnerlisting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(winnerlisting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			destroy_component(winnerlisting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(37:2) {#if yesterday.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let div0;
    	let t4;
    	let current_block_type_index;
    	let if_block0;
    	let t5;
    	let div1_class_value;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*today*/ ctx[1].length < 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*yesterday*/ ctx[2].length > 0 && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Here find the daily winners of the blue lobster, silver snail and green rhino. We also have a\n    lovely assortment of runner ups.";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Today's leaders";
    			t4 = space();
    			if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(img, "class", "logo");
    			if (!src_url_equal(img.src, img_src_value = "./images/logo_new.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "log");
    			add_location(img, file$7, 24, 0, 551);
    			attr_dev(p, "align", "justify");
    			add_location(p, file$7, 26, 2, 631);
    			attr_dev(div0, "class", "title svelte-usln9f");
    			add_location(div0, file$7, 30, 2, 795);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-usln9f"));
    			add_location(div1, file$7, 25, 0, 610);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t4);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div1, t5);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div1, t5);
    			}

    			if (/*yesterday*/ ctx[2].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*yesterday*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*size*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-usln9f"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $connectionUrl;
    	validate_store(connectionUrl, 'connectionUrl');
    	component_subscribe($$self, connectionUrl, $$value => $$invalidate(3, $connectionUrl = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Winners', slots, []);
    	let { size } = $$props;
    	let today = [];
    	let yesterday = [];

    	onMount(async () => {
    		const response = await fetch("https://" + $connectionUrl + "/winners", { method: "GET" });

    		if (response.status === 200) {
    			const data = await response.json();
    			$$invalidate(1, today = data.today);
    			$$invalidate(2, yesterday = data.yesterday);
    		} else {
    			throw new Error(response.statusText);
    		}
    	});

    	const writable_props = ['size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Winners> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		connectionUrl,
    		WinnerListing,
    		size,
    		today,
    		yesterday,
    		$connectionUrl
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('today' in $$props) $$invalidate(1, today = $$props.today);
    		if ('yesterday' in $$props) $$invalidate(2, yesterday = $$props.yesterday);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, today, yesterday];
    }

    class Winners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Winners",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console.warn("<Winners> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error_1("<Winners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error_1("<Winners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Rules.svelte generated by Svelte v3.48.0 */

    const file$6 = "src/Rules.svelte";

    function create_fragment$7(ctx) {
    	let div5;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div4;
    	let div0;
    	let t2;
    	let p0;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let span2;
    	let t8;
    	let t9;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let p1;
    	let t11;
    	let span3;
    	let t13;
    	let t14;
    	let div2;
    	let span4;
    	let t16;
    	let span5;
    	let t18;
    	let span6;
    	let t20;
    	let span7;
    	let t22;
    	let span8;
    	let t24;
    	let span9;
    	let t26;
    	let p2;
    	let t28;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t29;
    	let p3;
    	let div4_class_value;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "Rules";
    			t2 = space();
    			p0 = element("p");
    			span0 = element("span");
    			span0.textContent = "Four players";
    			t4 = text(" cooperate to create as many words as possible.\n      Each player has their own ");
    			span1 = element("span");
    			span1.textContent = "4x4 area, and moves by";
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "swapping adjacent";
    			t8 = text(" letters.");
    			t9 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t10 = space();
    			p1 = element("p");
    			t11 = text("The goal is to work together to create longer words, as points scale exponentially with\n      length, with the minimum length being ");
    			span3 = element("span");
    			span3.textContent = "three";
    			t13 = text(". That means an\n      8-letter word is 32 points.");
    			t14 = space();
    			div2 = element("div");
    			span4 = element("span");
    			span4.textContent = "1.";
    			t16 = space();
    			span5 = element("span");
    			span5.textContent = "2.";
    			t18 = space();
    			span6 = element("span");
    			span6.textContent = "4.";
    			t20 = space();
    			span7 = element("span");
    			span7.textContent = "8.";
    			t22 = space();
    			span8 = element("span");
    			span8.textContent = "16.";
    			t24 = space();
    			span9 = element("span");
    			span9.textContent = "32.";
    			t26 = space();
    			p2 = element("p");
    			p2.textContent = "Make words left to right and top to bottom, trying to connect across to other player areas";
    			t28 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t29 = space();
    			p3 = element("p");
    			p3.textContent = "The top ten teams of the day will be displayed.";
    			attr_dev(img0, "class", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/logo_new.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "log");
    			add_location(img0, file$6, 5, 2, 93);
    			attr_dev(div0, "class", "title svelte-usln9f");
    			add_location(div0, file$6, 8, 4, 178);
    			attr_dev(span0, "class", "highlight svelte-usln9f");
    			add_location(span0, file$6, 10, 6, 239);
    			attr_dev(span1, "class", "highlight svelte-usln9f");
    			add_location(span1, file$6, 11, 32, 362);
    			attr_dev(span2, "class", "highlight svelte-usln9f");
    			add_location(span2, file$6, 12, 6, 423);
    			attr_dev(p0, "align", "justify");
    			add_location(p0, file$6, 9, 4, 213);
    			if (!src_url_equal(img1.src, img1_src_value = "images/swapping_transparent.gif")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "swapping letters");
    			add_location(img1, file$6, 16, 6, 538);
    			attr_dev(div1, "class", "instruction-img-mobile");
    			add_location(div1, file$6, 15, 4, 495);
    			attr_dev(span3, "class", "highlight svelte-usln9f");
    			add_location(span3, file$6, 20, 44, 780);
    			attr_dev(p1, "align", "justify");
    			add_location(p1, file$6, 18, 4, 622);
    			attr_dev(span4, "class", "points svelte-usln9f");
    			add_location(span4, file$6, 24, 6, 891);
    			attr_dev(span5, "class", "points svelte-usln9f");
    			add_location(span5, file$6, 25, 6, 928);
    			attr_dev(span6, "class", "points svelte-usln9f");
    			add_location(span6, file$6, 26, 6, 965);
    			attr_dev(span7, "class", "points svelte-usln9f");
    			add_location(span7, file$6, 27, 6, 1002);
    			attr_dev(span8, "class", "points svelte-usln9f");
    			add_location(span8, file$6, 28, 6, 1039);
    			attr_dev(span9, "class", "points svelte-usln9f");
    			add_location(span9, file$6, 29, 6, 1077);
    			add_location(div2, file$6, 23, 4, 879);
    			attr_dev(p2, "align", "justify");
    			add_location(p2, file$6, 31, 4, 1124);
    			if (!src_url_equal(img2.src, img2_src_value = "images/instructions-mobile.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "swapping letters");
    			add_location(img2, file$6, 35, 6, 1297);
    			attr_dev(div3, "class", "instruction-img-mobile");
    			add_location(div3, file$6, 34, 4, 1254);
    			attr_dev(p3, "align", "justify");
    			add_location(p3, file$6, 37, 4, 1380);
    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-usln9f"));
    			add_location(div4, file$6, 7, 2, 155);
    			set_style(div5, "width", "100%");
    			attr_dev(div5, "class", "centered-container");
    			add_location(div5, file$6, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img0);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t2);
    			append_dev(div4, p0);
    			append_dev(p0, span0);
    			append_dev(p0, t4);
    			append_dev(p0, span1);
    			append_dev(p0, t6);
    			append_dev(p0, span2);
    			append_dev(p0, t8);
    			append_dev(div4, t9);
    			append_dev(div4, div1);
    			append_dev(div1, img1);
    			append_dev(div4, t10);
    			append_dev(div4, p1);
    			append_dev(p1, t11);
    			append_dev(p1, span3);
    			append_dev(p1, t13);
    			append_dev(div4, t14);
    			append_dev(div4, div2);
    			append_dev(div2, span4);
    			append_dev(div2, t16);
    			append_dev(div2, span5);
    			append_dev(div2, t18);
    			append_dev(div2, span6);
    			append_dev(div2, t20);
    			append_dev(div2, span7);
    			append_dev(div2, t22);
    			append_dev(div2, span8);
    			append_dev(div2, t24);
    			append_dev(div2, span9);
    			append_dev(div4, t26);
    			append_dev(div4, p2);
    			append_dev(div4, t28);
    			append_dev(div4, div3);
    			append_dev(div3, img2);
    			append_dev(div4, t29);
    			append_dev(div4, p3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-usln9f"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rules', slots, []);
    	let { size } = $$props;
    	const writable_props = ['size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Rules> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ size });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size];
    }

    class Rules extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rules",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console.warn("<Rules> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error("<Rules>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Rules>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Home.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$5 = "src/Home.svelte";

    // (58:0) {#if error}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Username must be 1-21 characters long.";
    			set_style(div, "color", "#ee110f");
    			set_style(div, "margin-top", "10px");
    			add_location(div, file$5, 58, 2, 1650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(58:0) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let p0;
    	let t1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let span3;
    	let t9;
    	let t10;
    	let div0;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let p1;
    	let t12;
    	let a;
    	let b;
    	let t14;
    	let t15;
    	let div1_class_value;
    	let t16;
    	let form;
    	let input;
    	let t17;
    	let button;
    	let t19;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*error*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t1 = text("A new board is released every day on which ");
    			span0 = element("span");
    			span0.textContent = "four players";
    			t3 = text(" cooperate\n    to create as many words as possible in ");
    			span1 = element("span");
    			span1.textContent = "90 seconds.";
    			t5 = text("\n    Each player works in their own ");
    			span2 = element("span");
    			span2.textContent = "4x4 area";
    			t7 = text("\n    rearranging by ");
    			span3 = element("span");
    			span3.textContent = "swapping adjacent";
    			t9 = text(" letters.");
    			t10 = space();
    			div0 = element("div");
    			img1 = element("img");
    			t11 = space();
    			p1 = element("p");
    			t12 = text("Players should try to connect their words with others to make the long words possible, as points\n    scale exponentially. If this is your first time to play please ");
    			a = element("a");
    			b = element("b");
    			b.textContent = "read the rules first";
    			t14 = text(",");
    			t15 = text(" otherwise pick your username (1-21 characters) and play!");
    			t16 = space();
    			form = element("form");
    			input = element("input");
    			t17 = space();
    			button = element("button");
    			button.textContent = "Play";
    			t19 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(img0, "class", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/logo_new.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "log");
    			add_location(img0, file$5, 23, 0, 466);
    			attr_dev(span0, "class", "highlight svelte-doz3ot");
    			add_location(span0, file$5, 26, 47, 613);
    			attr_dev(span1, "class", "higlight");
    			add_location(span1, file$5, 27, 43, 710);
    			attr_dev(span2, "class", "highlight svelte-doz3ot");
    			add_location(span2, file$5, 28, 35, 787);
    			attr_dev(span3, "class", "highlight svelte-doz3ot");
    			add_location(span3, file$5, 29, 19, 846);
    			attr_dev(p0, "align", "justify");
    			add_location(p0, file$5, 25, 2, 546);
    			if (!src_url_equal(img1.src, img1_src_value = "images/swapping_transparent.gif")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "swapping letters");
    			add_location(img1, file$5, 33, 4, 948);
    			attr_dev(div0, "class", "instruction-img svelte-doz3ot");
    			add_location(div0, file$5, 32, 2, 914);
    			add_location(b, file$5, 42, 9, 1314);
    			attr_dev(a, "href", "/");
    			add_location(a, file$5, 38, 67, 1217);
    			attr_dev(p1, "align", "justify");
    			add_location(p1, file$5, 36, 2, 1029);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-doz3ot"));
    			add_location(div1, file$5, 24, 0, 525);
    			attr_dev(input, "placeholder", "Username");
    			attr_dev(input, "minlength", "1");
    			attr_dev(input, "maxlength", "21");
    			add_location(input, file$5, 47, 2, 1449);
    			attr_dev(button, "class", "svelte-doz3ot");
    			add_location(button, file$5, 54, 2, 1574);
    			add_location(form, file$5, 46, 0, 1423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(p0, span0);
    			append_dev(p0, t3);
    			append_dev(p0, span1);
    			append_dev(p0, t5);
    			append_dev(p0, span2);
    			append_dev(p0, t7);
    			append_dev(p0, span3);
    			append_dev(p0, t9);
    			append_dev(div1, t10);
    			append_dev(div1, div0);
    			append_dev(div0, img1);
    			append_dev(div1, t11);
    			append_dev(div1, p1);
    			append_dev(p1, t12);
    			append_dev(p1, a);
    			append_dev(a, b);
    			append_dev(a, t14);
    			append_dev(p1, t15);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			/*input_binding*/ ctx[6](input);
    			set_input_value(input, /*$username*/ ctx[3]);
    			append_dev(form, t17);
    			append_dev(form, button);
    			insert_dev(target, t19, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[5]), false, true, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(button, "click", prevent_default(/*play*/ ctx[4]), false, true, false),
    					listen_dev(form, "submit", /*play*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-doz3ot"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$username*/ 8 && input.value !== /*$username*/ ctx[3]) {
    				set_input_value(input, /*$username*/ ctx[3]);
    			}

    			if (/*error*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(form);
    			/*input_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t19);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $username;
    	validate_store(username, 'username');
    	component_subscribe($$self, username, $$value => $$invalidate(3, $username = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let { size } = $$props;
    	let inp;
    	let error = false;

    	function play() {
    		console.log($username.length, $username.length > 0 && $username.length < 22);

    		if ($username.length > 0 && $username.length < 22) {
    			$$invalidate(2, error = false);
    			connectServer();
    		} else {
    			$$invalidate(2, error = true);
    		}
    	}

    	onMount(() => {
    		inp.focus();
    	});

    	const writable_props = ['size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		setGameState("rules");
    	};

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inp = $$value;
    			$$invalidate(1, inp);
    		});
    	}

    	function input_input_handler() {
    		$username = this.value;
    		username.set($username);
    	}

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		username,
    		setGameState,
    		connectServer,
    		size,
    		inp,
    		error,
    		play,
    		$username
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('inp' in $$props) $$invalidate(1, inp = $$props.inp);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		inp,
    		error,
    		$username,
    		play,
    		click_handler,
    		input_binding,
    		input_input_handler
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console_1.warn("<Home> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Play/Starting.svelte generated by Svelte v3.48.0 */

    const file$4 = "src/Play/Starting.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Game is starting soon!";
    			t2 = space();
    			img1 = element("img");
    			attr_dev(img0, "class", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/logo_new.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "log");
    			add_location(img0, file$4, 1, 2, 35);
    			attr_dev(div0, "class", "title svelte-186j1hu");
    			add_location(div0, file$4, 2, 2, 96);
    			if (!src_url_equal(img1.src, img1_src_value = "images/starting.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "150px");
    			attr_dev(img1, "alt", "loading");
    			add_location(img1, file$4, 3, 2, 146);
    			attr_dev(div1, "class", "centered-container");
    			add_location(div1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Starting', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Starting> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Starting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Starting",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/svelte-media-query/src/MediaQuery.svelte generated by Svelte v3.48.0 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, matches*/ 9)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MediaQuery', slots, ['default']);
    	let { query } = $$props;
    	let mql;
    	let mqlListener;
    	let wasMounted = false;
    	let matches = false;

    	onMount(() => {
    		$$invalidate(2, wasMounted = true);

    		return () => {
    			removeActiveListener();
    		};
    	});

    	function addNewListener(query) {
    		mql = window.matchMedia(query);
    		mqlListener = v => $$invalidate(0, matches = v.matches);

    		mql.addEventListener
    		? mql.addEventListener("change", mqlListener)
    		: mql.addListener(mqlListener);

    		$$invalidate(0, matches = mql.matches);
    	}

    	function removeActiveListener() {
    		if (mql && mqlListener) {
    			mql.removeEventListener
    			? mql.removeEventListener("change", mqlListener)
    			: mql.removeListener(mqlListener);
    		}
    	}

    	const writable_props = ['query'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		query,
    		mql,
    		mqlListener,
    		wasMounted,
    		matches,
    		addNewListener,
    		removeActiveListener
    	});

    	$$self.$inject_state = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('mql' in $$props) mql = $$props.mql;
    		if ('mqlListener' in $$props) mqlListener = $$props.mqlListener;
    		if ('wasMounted' in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
    		if ('matches' in $$props) $$invalidate(0, matches = $$props.matches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
    			{
    				if (wasMounted) {
    					removeActiveListener();
    					addNewListener(query);
    				}
    			}
    		}
    	};

    	return [matches, query, wasMounted, $$scope, slots];
    }

    class MediaQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*query*/ ctx[1] === undefined && !('query' in props)) {
    			console.warn("<MediaQuery> was created without expected prop 'query'");
    		}
    	}

    	get query() {
    		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Play/Waiting.svelte generated by Svelte v3.48.0 */
    const file$3 = "src/Play/Waiting.svelte";

    function create_fragment$3(ctx) {
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div1;
    	let t4;
    	let t5;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Finding players...";
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Found: ");
    			t5 = text(/*$userCount*/ ctx[1]);
    			attr_dev(img0, "class", "logo");
    			if (!src_url_equal(img0.src, img0_src_value = "./images/logo_new.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "log");
    			add_location(img0, file$3, 6, 0, 82);
    			attr_dev(div0, "class", "title svelte-10lv29n");
    			add_location(div0, file$3, 8, 2, 162);
    			if (!src_url_equal(img1.src, img1_src_value = "images/waiting.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "150px");
    			attr_dev(img1, "alt", "loading");
    			add_location(img1, file$3, 9, 2, 208);
    			attr_dev(div1, "class", "player-count svelte-10lv29n");
    			add_location(div1, file$3, 10, 2, 271);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-10lv29n"));
    			add_location(div2, file$3, 7, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, img1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$userCount*/ 2) set_data_dev(t5, /*$userCount*/ ctx[1]);

    			if (dirty & /*size*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*size*/ ctx[0]) + " svelte-10lv29n"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $userCount;
    	validate_store(userCount, 'userCount');
    	component_subscribe($$self, userCount, $$value => $$invalidate(1, $userCount = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Waiting', slots, []);
    	let { size } = $$props;
    	const writable_props = ['size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Waiting> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ userCount, size, $userCount });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, $userCount];
    }

    class Waiting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Waiting",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !('size' in props)) {
    			console.warn("<Waiting> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error("<Waiting>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Waiting>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Play/Cell.svelte generated by Svelte v3.48.0 */

    const file$2 = "src/Play/Cell.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div0_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*letter*/ ctx[3]);
    			attr_dev(div0, "class", div0_class_value = "cell " + /*color*/ ctx[4] + " " + /*animationDirection*/ ctx[8] + " " + /*selected*/ ctx[5] + " svelte-14kdja4");
    			set_style(div0, "width", /*size*/ ctx[2] + "px");
    			set_style(div0, "height", /*size*/ ctx[2] + "px");
    			set_style(div0, "font-size", (/*size*/ ctx[2] == 70 ? 46 : /*size*/ ctx[2] / 70 * 46) + "px");
    			add_location(div0, file$2, 13, 2, 283);
    			attr_dev(div1, "class", "cell-wrapper svelte-14kdja4");
    			set_style(div1, "transform", "translate(" + /*x*/ ctx[0] + "px, " + /*y*/ ctx[1] + "px)");
    			add_location(div1, file$2, 12, 0, 210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*letter*/ 8) set_data_dev(t, /*letter*/ ctx[3]);

    			if (dirty & /*color, animationDirection, selected*/ 304 && div0_class_value !== (div0_class_value = "cell " + /*color*/ ctx[4] + " " + /*animationDirection*/ ctx[8] + " " + /*selected*/ ctx[5] + " svelte-14kdja4")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*size*/ 4) {
    				set_style(div0, "width", /*size*/ ctx[2] + "px");
    			}

    			if (dirty & /*size*/ 4) {
    				set_style(div0, "height", /*size*/ ctx[2] + "px");
    			}

    			if (dirty & /*size*/ 4) {
    				set_style(div0, "font-size", (/*size*/ ctx[2] == 70 ? 46 : /*size*/ ctx[2] / 70 * 46) + "px");
    			}

    			if (dirty & /*x, y*/ 3) {
    				set_style(div1, "transform", "translate(" + /*x*/ ctx[0] + "px, " + /*y*/ ctx[1] + "px)");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cell', slots, []);
    	let { x } = $$props;
    	let { y } = $$props;
    	let { size } = $$props;
    	let { letter } = $$props;
    	let { color } = $$props;
    	let { selected } = $$props;
    	let { selectCell } = $$props;
    	let { id } = $$props;
    	let { animationDirection } = $$props;

    	const writable_props = [
    		'x',
    		'y',
    		'size',
    		'letter',
    		'color',
    		'selected',
    		'selectCell',
    		'id',
    		'animationDirection'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectCell(id);

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('letter' in $$props) $$invalidate(3, letter = $$props.letter);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('selected' in $$props) $$invalidate(5, selected = $$props.selected);
    		if ('selectCell' in $$props) $$invalidate(6, selectCell = $$props.selectCell);
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    		if ('animationDirection' in $$props) $$invalidate(8, animationDirection = $$props.animationDirection);
    	};

    	$$self.$capture_state = () => ({
    		x,
    		y,
    		size,
    		letter,
    		color,
    		selected,
    		selectCell,
    		id,
    		animationDirection
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('letter' in $$props) $$invalidate(3, letter = $$props.letter);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('selected' in $$props) $$invalidate(5, selected = $$props.selected);
    		if ('selectCell' in $$props) $$invalidate(6, selectCell = $$props.selectCell);
    		if ('id' in $$props) $$invalidate(7, id = $$props.id);
    		if ('animationDirection' in $$props) $$invalidate(8, animationDirection = $$props.animationDirection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		x,
    		y,
    		size,
    		letter,
    		color,
    		selected,
    		selectCell,
    		id,
    		animationDirection,
    		click_handler
    	];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			x: 0,
    			y: 1,
    			size: 2,
    			letter: 3,
    			color: 4,
    			selected: 5,
    			selectCell: 6,
    			id: 7,
    			animationDirection: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !('x' in props)) {
    			console.warn("<Cell> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !('y' in props)) {
    			console.warn("<Cell> was created without expected prop 'y'");
    		}

    		if (/*size*/ ctx[2] === undefined && !('size' in props)) {
    			console.warn("<Cell> was created without expected prop 'size'");
    		}

    		if (/*letter*/ ctx[3] === undefined && !('letter' in props)) {
    			console.warn("<Cell> was created without expected prop 'letter'");
    		}

    		if (/*color*/ ctx[4] === undefined && !('color' in props)) {
    			console.warn("<Cell> was created without expected prop 'color'");
    		}

    		if (/*selected*/ ctx[5] === undefined && !('selected' in props)) {
    			console.warn("<Cell> was created without expected prop 'selected'");
    		}

    		if (/*selectCell*/ ctx[6] === undefined && !('selectCell' in props)) {
    			console.warn("<Cell> was created without expected prop 'selectCell'");
    		}

    		if (/*id*/ ctx[7] === undefined && !('id' in props)) {
    			console.warn("<Cell> was created without expected prop 'id'");
    		}

    		if (/*animationDirection*/ ctx[8] === undefined && !('animationDirection' in props)) {
    			console.warn("<Cell> was created without expected prop 'animationDirection'");
    		}
    	}

    	get x() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get letter() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectCell() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectCell(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animationDirection() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animationDirection(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Play/Game.svelte generated by Svelte v3.48.0 */

    const file$1 = "src/Play/Game.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (119:2) {#if $gameTimerProgress >= 0}
    function create_if_block_1$1(ctx) {
    	let progress;
    	let progress_value_value;

    	const block = {
    		c: function create() {
    			progress = element("progress");
    			set_style(progress, "width", /*size*/ ctx[2] * 8 + /*buffer*/ ctx[3] * 7 + "px");
    			progress.value = progress_value_value = 100 - /*$gameTimerProgress*/ ctx[5];
    			attr_dev(progress, "max", "100");
    			attr_dev(progress, "class", "svelte-1vfwiws");
    			add_location(progress, file$1, 119, 4, 3172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, progress, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size, buffer*/ 12) {
    				set_style(progress, "width", /*size*/ ctx[2] * 8 + /*buffer*/ ctx[3] * 7 + "px");
    			}

    			if (dirty & /*$gameTimerProgress*/ 32 && progress_value_value !== (progress_value_value = 100 - /*$gameTimerProgress*/ ctx[5])) {
    				prop_dev(progress, "value", progress_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(progress);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(119:2) {#if $gameTimerProgress >= 0}",
    		ctx
    	});

    	return block;
    }

    // (133:2) {#if $board}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$board*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$board, size, selectCell*/ 134) {
    				each_value = /*$board*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(133:2) {#if $board}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#each $board as square, i}
    function create_each_block(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				id: /*square*/ ctx[19].id,
    				x: /*square*/ ctx[19].x,
    				y: /*square*/ ctx[19].y,
    				size: /*size*/ ctx[2],
    				color: /*square*/ ctx[19].color,
    				letter: /*square*/ ctx[19].letter,
    				selected: /*square*/ ctx[19].selected ? "selected" : "",
    				animationDirection: /*square*/ ctx[19].animationDirection,
    				selectCell: /*selectCell*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty & /*$board*/ 2) cell_changes.id = /*square*/ ctx[19].id;
    			if (dirty & /*$board*/ 2) cell_changes.x = /*square*/ ctx[19].x;
    			if (dirty & /*$board*/ 2) cell_changes.y = /*square*/ ctx[19].y;
    			if (dirty & /*size*/ 4) cell_changes.size = /*size*/ ctx[2];
    			if (dirty & /*$board*/ 2) cell_changes.color = /*square*/ ctx[19].color;
    			if (dirty & /*$board*/ 2) cell_changes.letter = /*square*/ ctx[19].letter;
    			if (dirty & /*$board*/ 2) cell_changes.selected = /*square*/ ctx[19].selected ? "selected" : "";
    			if (dirty & /*$board*/ 2) cell_changes.animationDirection = /*square*/ ctx[19].animationDirection;
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(134:4) {#each $board as square, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1_value = /*$users*/ ctx[6][0] + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*$users*/ ctx[6][1] + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5;
    	let div7;
    	let div5;
    	let t6_value = /*$users*/ ctx[6][2] + "";
    	let t6;
    	let t7;
    	let div6;
    	let t8_value = /*$users*/ ctx[6][3] + "";
    	let t8;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[8]);
    	let if_block0 = /*$gameTimerProgress*/ ctx[5] >= 0 && create_if_block_1$1(ctx);
    	let if_block1 = /*$board*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div6 = element("div");
    			t8 = text(t8_value);
    			attr_dev(div0, "id", "progressbar");
    			set_style(div0, "position", "relative");
    			set_style(div0, "margin-left", /*offset*/ ctx[4] + "px");
    			attr_dev(div0, "class", "wrapper svelte-1vfwiws");
    			add_location(div0, file$1, 117, 0, 3045);
    			attr_dev(div1, "class", "name svelte-1vfwiws");
    			set_style(div1, "color", "#05b008");
    			set_style(div1, "position", "absolute");
    			set_style(div1, "top", "-36px");
    			add_location(div1, file$1, 123, 2, 3360);
    			attr_dev(div2, "class", "name svelte-1vfwiws");
    			set_style(div2, "color", "#ffaa1d");
    			set_style(div2, "position", "absolute");
    			set_style(div2, "top", "-36px");
    			set_style(div2, "left", /*size*/ ctx[2] * 4 + /*buffer*/ ctx[3] * 4 + "px");
    			add_location(div2, file$1, 124, 2, 3453);
    			set_style(div3, "position", "relative");
    			set_style(div3, "margin-left", /*offset*/ ctx[4] + "px");
    			attr_dev(div3, "class", "wrapper svelte-1vfwiws");
    			add_location(div3, file$1, 122, 0, 3284);
    			set_style(div4, "margin-left", /*offset*/ ctx[4] + "px");
    			attr_dev(div4, "class", "wrapper svelte-1vfwiws");
    			add_location(div4, file$1, 131, 0, 3602);
    			attr_dev(div5, "class", "name svelte-1vfwiws");
    			set_style(div5, "color", "#1974d1");
    			set_style(div5, "position", "absolute");
    			set_style(div5, "top", "-20px");
    			add_location(div5, file$1, 154, 2, 4144);
    			attr_dev(div6, "class", "name svelte-1vfwiws");
    			set_style(div6, "color", "#ff007f");
    			set_style(div6, "position", "absolute");
    			set_style(div6, "top", "-20px");
    			set_style(div6, "left", /*size*/ ctx[2] * 4 + /*buffer*/ ctx[3] * 4 + "px");
    			add_location(div6, file$1, 155, 2, 4237);
    			set_style(div7, "position", "relative");
    			set_style(div7, "margin-left", /*offset*/ ctx[4] + "px");
    			set_style(div7, "margin-top", 60 + /*size*/ ctx[2] * 8 + /*buffer*/ ctx[3] * 8 + 20 + "px");
    			add_location(div7, file$1, 148, 0, 4020);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			if (if_block1) if_block1.m(div4, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div5);
    			append_dev(div5, t6);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, t8);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*onwindowresize*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$gameTimerProgress*/ ctx[5] >= 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*offset*/ 16) {
    				set_style(div0, "margin-left", /*offset*/ ctx[4] + "px");
    			}

    			if ((!current || dirty & /*$users*/ 64) && t1_value !== (t1_value = /*$users*/ ctx[6][0] + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*$users*/ 64) && t3_value !== (t3_value = /*$users*/ ctx[6][1] + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*size, buffer*/ 12) {
    				set_style(div2, "left", /*size*/ ctx[2] * 4 + /*buffer*/ ctx[3] * 4 + "px");
    			}

    			if (!current || dirty & /*offset*/ 16) {
    				set_style(div3, "margin-left", /*offset*/ ctx[4] + "px");
    			}

    			if (/*$board*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$board*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*offset*/ 16) {
    				set_style(div4, "margin-left", /*offset*/ ctx[4] + "px");
    			}

    			if ((!current || dirty & /*$users*/ 64) && t6_value !== (t6_value = /*$users*/ ctx[6][2] + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*$users*/ 64) && t8_value !== (t8_value = /*$users*/ ctx[6][3] + "")) set_data_dev(t8, t8_value);

    			if (!current || dirty & /*size, buffer*/ 12) {
    				set_style(div6, "left", /*size*/ ctx[2] * 4 + /*buffer*/ ctx[3] * 4 + "px");
    			}

    			if (!current || dirty & /*offset*/ 16) {
    				set_style(div7, "margin-left", /*offset*/ ctx[4] + "px");
    			}

    			if (!current || dirty & /*size, buffer*/ 12) {
    				set_style(div7, "margin-top", 60 + /*size*/ ctx[2] * 8 + /*buffer*/ ctx[3] * 8 + 20 + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $board;
    	let $quadrant;
    	let $gameID;
    	let $gameTimerProgress;
    	let $users;
    	validate_store(board, 'board');
    	component_subscribe($$self, board, $$value => $$invalidate(1, $board = $$value));
    	validate_store(quadrant$1, 'quadrant');
    	component_subscribe($$self, quadrant$1, $$value => $$invalidate(10, $quadrant = $$value));
    	validate_store(gameID, 'gameID');
    	component_subscribe($$self, gameID, $$value => $$invalidate(11, $gameID = $$value));
    	validate_store(gameTimerProgress, 'gameTimerProgress');
    	component_subscribe($$self, gameTimerProgress, $$value => $$invalidate(5, $gameTimerProgress = $$value));
    	validate_store(users, 'users');
    	component_subscribe($$self, users, $$value => $$invalidate(6, $users = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let windowWidth;
    	let size = 50;
    	let buffer = 8;
    	let maxBuffer = 8;
    	let offset;
    	let currentSelected = -1;

    	function resizeBoard() {
    		if ($board) {
    			$$invalidate(4, offset = (windowWidth - 8 * (size + buffer)) / 2 - buffer / 2);

    			if (windowWidth > 500) {
    				$$invalidate(2, size = 50 + 20 * windowWidth / 2000);
    				$$invalidate(3, buffer = maxBuffer);
    				$$invalidate(4, offset -= buffer * 8 / 2);
    			} else if ($board) {
    				$$invalidate(2, size = windowWidth / 500 * 50);
    				$$invalidate(3, buffer = windowWidth / 500 * maxBuffer);
    			}

    			for (let i = 0; i < $board.length; i++) {
    				set_store_value(board, $board[i].x = $board[i].col * (size + buffer), $board);
    				set_store_value(board, $board[i].y = $board[i].row * (size + buffer), $board);
    			}

    			board.set($board);
    		}
    	}

    	function getSwap(row, col) {
    		let currentRow = $board[currentSelected].row;
    		let currentCol = $board[currentSelected].col;

    		if (Math.abs(row - currentRow) == 1 && col == currentCol) {
    			return ["flipVerticalCurrent", "flipVerticalPrevious"];
    		} else if (row == currentRow && Math.abs(col - currentCol) == 1) {
    			return ["flipHorizontalCurrent", "flipHorizontalPrevious"];
    		}

    		return "none";
    	}

    	function sendSelect(id) {
    		let event = {
    			op: "select",
    			row: $board[id].row,
    			col: $board[id].col
    		};

    		let msg = {
    			op: "game-event",
    			game_id: $gameID,
    			event: JSON.stringify(event)
    		};

    		msg = JSON.stringify(msg);
    		sendMessage(msg);
    	}

    	function sendSwap(idx1, idx2) {
    		let event = {
    			op: "swap",
    			row1: $board[idx1].row,
    			col1: $board[idx1].col,
    			row2: $board[idx2].row,
    			col2: $board[idx2].col
    		};

    		let msg = {
    			op: "game-event",
    			game_id: $gameID,
    			event: JSON.stringify(event)
    		};

    		msg = JSON.stringify(msg);
    		sendMessage(msg);
    	}

    	function setSelected(id) {
    		set_store_value(board, $board[id].selected = true, $board);
    		sendSelect(id);

    		if (currentSelected != -1) {
    			set_store_value(board, $board[currentSelected].selected = false, $board);
    		}

    		if ($board[id].selected) {
    			currentSelected = id;
    		} else {
    			currentSelected = -1;
    		}
    	}

    	function selectCell(id) {
    		let row = $board[id].row;
    		let col = $board[id].col;
    		let swap = "none";

    		if (getQuadrant(row, col) != $quadrant) {
    			return;
    		}

    		if (currentSelected != -1) {
    			swap = getSwap(row, col);
    			set_store_value(board, $board[currentSelected].animationDirection = swap[0], $board);
    			set_store_value(board, $board[id].animationDirection = swap[1], $board);

    			if (swap != "none") {
    				let temp = $board[currentSelected].letter;
    				set_store_value(board, $board[currentSelected].letter = $board[id].letter, $board);
    				set_store_value(board, $board[id].letter = temp, $board);
    				sendSwap(id, currentSelected);
    			}
    		}

    		setSelected(id);
    	}

    	onMount(() => {
    		resizeBoard();
    	});

    	function update() {
    		board.set($board);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, windowWidth = window.innerWidth);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Cell,
    		getQuadrant,
    		gameTimerProgress,
    		users,
    		board,
    		quadrant: quadrant$1,
    		gameID,
    		sendMessage,
    		windowWidth,
    		size,
    		buffer,
    		maxBuffer,
    		offset,
    		currentSelected,
    		resizeBoard,
    		getSwap,
    		sendSelect,
    		sendSwap,
    		setSelected,
    		selectCell,
    		update,
    		$board,
    		$quadrant,
    		$gameID,
    		$gameTimerProgress,
    		$users
    	});

    	$$self.$inject_state = $$props => {
    		if ('windowWidth' in $$props) $$invalidate(0, windowWidth = $$props.windowWidth);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('buffer' in $$props) $$invalidate(3, buffer = $$props.buffer);
    		if ('maxBuffer' in $$props) maxBuffer = $$props.maxBuffer;
    		if ('offset' in $$props) $$invalidate(4, offset = $$props.offset);
    		if ('currentSelected' in $$props) currentSelected = $$props.currentSelected;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*windowWidth*/ 1) {
    			(resizeBoard());
    		}

    		if ($$self.$$.dirty & /*$board*/ 2) {
    			(update());
    		}
    	};

    	return [
    		windowWidth,
    		$board,
    		size,
    		buffer,
    		offset,
    		$gameTimerProgress,
    		$users,
    		selectCell,
    		onwindowresize
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    // (14:2) {#if matches}
    function create_if_block_18(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let li1;
    	let a1;
    	let t2;
    	let li2;
    	let a2;
    	let t4;
    	let li3;
    	let a3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "play";
    			t2 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "rules";
    			t4 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "winners";
    			if (!src_url_equal(img.src, img_src_value = "images/logo_new.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "110px");
    			attr_dev(img, "alt", "home");
    			add_location(img, file, 16, 35, 592);
    			attr_dev(a0, "class", "active svelte-173cy8b");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 16, 8, 565);
    			attr_dev(li0, "class", "svelte-173cy8b");
    			add_location(li0, file, 15, 6, 552);
    			attr_dev(a1, "class", "active svelte-173cy8b");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 19, 8, 686);
    			attr_dev(li1, "class", "svelte-173cy8b");
    			add_location(li1, file, 18, 6, 673);
    			attr_dev(a2, "class", "active svelte-173cy8b");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file, 25, 8, 835);
    			attr_dev(li2, "class", "svelte-173cy8b");
    			add_location(li2, file, 24, 6, 822);
    			attr_dev(a3, "class", "active svelte-173cy8b");
    			attr_dev(a3, "href", "/");
    			add_location(a3, file, 29, 8, 958);
    			attr_dev(li3, "class", "svelte-173cy8b");
    			add_location(li3, file, 28, 6, 945);
    			attr_dev(ul, "class", "mobile svelte-173cy8b");
    			add_location(ul, file, 14, 4, 526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, img);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t2);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t4);
    			append_dev(ul, li3);
    			append_dev(li3, a3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(/*click_handler*/ ctx[3]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_1*/ ctx[4]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_2*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(14:2) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (13:0) <MediaQuery query="(max-width:480px)" let:matches>
    function create_default_slot_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[9] && create_if_block_18(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_18(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(13:0) <MediaQuery query=\\\"(max-width:480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if matches}
    function create_if_block_17(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let li1;
    	let a1;
    	let t2;
    	let li2;
    	let a2;
    	let t4;
    	let li3;
    	let a3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "play";
    			t2 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "rules";
    			t4 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "winners";
    			if (!src_url_equal(img.src, img_src_value = "images/logo_new.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "210px");
    			attr_dev(img, "alt", "home");
    			add_location(img, file, 41, 35, 1260);
    			attr_dev(a0, "class", "active svelte-173cy8b");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 41, 8, 1233);
    			attr_dev(li0, "class", "svelte-173cy8b");
    			add_location(li0, file, 40, 6, 1220);
    			attr_dev(a1, "class", "active svelte-173cy8b");
    			attr_dev(a1, "href", "/");
    			add_location(a1, file, 45, 8, 1355);
    			attr_dev(li1, "class", "svelte-173cy8b");
    			add_location(li1, file, 44, 6, 1342);
    			attr_dev(a2, "class", "active svelte-173cy8b");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file, 51, 8, 1504);
    			attr_dev(li2, "class", "svelte-173cy8b");
    			add_location(li2, file, 50, 6, 1491);
    			attr_dev(a3, "class", "active svelte-173cy8b");
    			attr_dev(a3, "href", "/");
    			add_location(a3, file, 55, 8, 1627);
    			attr_dev(li3, "class", "svelte-173cy8b");
    			add_location(li3, file, 54, 6, 1614);
    			attr_dev(ul, "class", "not-mobile svelte-173cy8b");
    			add_location(ul, file, 39, 4, 1190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, img);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t2);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t4);
    			append_dev(ul, li3);
    			append_dev(li3, a3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(/*click_handler_3*/ ctx[6]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_4*/ ctx[7]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_5*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(39:2) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (38:0) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[9] && create_if_block_17(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_17(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(38:0) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#if matches}
    function create_if_block_9(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	const if_block_creators = [
    		create_if_block_10,
    		create_if_block_11,
    		create_if_block_12,
    		create_if_block_13,
    		create_if_block_14,
    		create_if_block_15,
    		create_if_block_16
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$gameState*/ ctx[0] == "disconnected") return 0;
    		if (/*$gameState*/ ctx[0] == "waiting") return 1;
    		if (/*$gameState*/ ctx[0] == "start-countdown") return 2;
    		if (/*$gameState*/ ctx[0] == "rules") return 3;
    		if (/*$gameState*/ ctx[0] == "winners") return 4;
    		if (/*$gameState*/ ctx[0] == "abort-game") return 5;
    		if (/*$gameState*/ ctx[0] == "finish-game") return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "centered-container");
    			add_location(div, file, 65, 4, 1859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(65:2) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (79:44) 
    function create_if_block_16(ctx) {
    	let finish;
    	let current;

    	finish = new Finish({
    			props: {
    				size: "desktop",
    				words: /*$finalWords*/ ctx[1],
    				score: /*$finalScore*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(finish.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(finish, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const finish_changes = {};
    			if (dirty & /*$finalWords*/ 2) finish_changes.words = /*$finalWords*/ ctx[1];
    			if (dirty & /*$finalScore*/ 4) finish_changes.score = /*$finalScore*/ ctx[2];
    			finish.$set(finish_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(finish.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(finish.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(finish, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(79:44) ",
    		ctx
    	});

    	return block;
    }

    // (77:43) 
    function create_if_block_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Game was aborted!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(77:43) ",
    		ctx
    	});

    	return block;
    }

    // (75:40) 
    function create_if_block_14(ctx) {
    	let winners;
    	let current;

    	winners = new Winners({
    			props: { size: "desktop" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(winners.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(winners, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(winners.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(winners.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(winners, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(75:40) ",
    		ctx
    	});

    	return block;
    }

    // (73:38) 
    function create_if_block_13(ctx) {
    	let rules;
    	let current;

    	rules = new Rules({
    			props: { size: "desktop" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(rules.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rules, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rules.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rules.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rules, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(73:38) ",
    		ctx
    	});

    	return block;
    }

    // (71:48) 
    function create_if_block_12(ctx) {
    	let starting;
    	let current;
    	starting = new Starting({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(starting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(starting, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(starting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(starting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(starting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(71:48) ",
    		ctx
    	});

    	return block;
    }

    // (69:40) 
    function create_if_block_11(ctx) {
    	let waiting;
    	let current;

    	waiting = new Waiting({
    			props: { size: "desktop" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(waiting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(waiting, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(waiting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(waiting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(waiting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(69:40) ",
    		ctx
    	});

    	return block;
    }

    // (67:6) {#if $gameState == "disconnected"}
    function create_if_block_10(ctx) {
    	let home;
    	let current;

    	home = new Home({
    			props: { size: "desktop" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(67:6) {#if $gameState == \\\"disconnected\\\"}",
    		ctx
    	});

    	return block;
    }

    // (64:0) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[9] && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(64:0) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#if matches}
    function create_if_block_1(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	const if_block_creators = [
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$gameState*/ ctx[0] == "disconnected") return 0;
    		if (/*$gameState*/ ctx[0] == "waiting") return 1;
    		if (/*$gameState*/ ctx[0] == "start-countdown") return 2;
    		if (/*$gameState*/ ctx[0] == "rules") return 3;
    		if (/*$gameState*/ ctx[0] == "winners") return 4;
    		if (/*$gameState*/ ctx[0] == "abort-game") return 5;
    		if (/*$gameState*/ ctx[0] == "finish-game") return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "centered-container");
    			add_location(div, file, 87, 4, 2575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(87:2) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (101:44) 
    function create_if_block_8(ctx) {
    	let finish;
    	let current;

    	finish = new Finish({
    			props: {
    				size: "mobile",
    				words: /*$finalWords*/ ctx[1],
    				score: /*$finalScore*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(finish.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(finish, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const finish_changes = {};
    			if (dirty & /*$finalWords*/ 2) finish_changes.words = /*$finalWords*/ ctx[1];
    			if (dirty & /*$finalScore*/ 4) finish_changes.score = /*$finalScore*/ ctx[2];
    			finish.$set(finish_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(finish.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(finish.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(finish, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(101:44) ",
    		ctx
    	});

    	return block;
    }

    // (99:43) 
    function create_if_block_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Game was aborted!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(99:43) ",
    		ctx
    	});

    	return block;
    }

    // (97:40) 
    function create_if_block_6(ctx) {
    	let winners;
    	let current;

    	winners = new Winners({
    			props: { size: "mobile" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(winners.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(winners, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(winners.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(winners.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(winners, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(97:40) ",
    		ctx
    	});

    	return block;
    }

    // (95:38) 
    function create_if_block_5(ctx) {
    	let rules;
    	let current;

    	rules = new Rules({
    			props: { size: "mobile" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(rules.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(rules, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rules.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rules.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(rules, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(95:38) ",
    		ctx
    	});

    	return block;
    }

    // (93:48) 
    function create_if_block_4(ctx) {
    	let starting;
    	let current;
    	starting = new Starting({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(starting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(starting, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(starting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(starting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(starting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(93:48) ",
    		ctx
    	});

    	return block;
    }

    // (91:40) 
    function create_if_block_3(ctx) {
    	let waiting;
    	let current;

    	waiting = new Waiting({
    			props: { size: "mobile" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(waiting.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(waiting, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(waiting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(waiting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(waiting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(91:40) ",
    		ctx
    	});

    	return block;
    }

    // (89:6) {#if $gameState == "disconnected"}
    function create_if_block_2(ctx) {
    	let home;
    	let current;

    	home = new Home({
    			props: { size: "mobile" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(89:6) {#if $gameState == \\\"disconnected\\\"}",
    		ctx
    	});

    	return block;
    }

    // (86:0) <MediaQuery query="(max-width:480px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[9] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(86:0) <MediaQuery query=\\\"(max-width:480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if $gameState == "start-game"}
    function create_if_block(ctx) {
    	let game;
    	let current;
    	game = new Game({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:0) {#if $gameState == \\\"start-game\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let mediaquery0;
    	let t0;
    	let mediaquery1;
    	let t1;
    	let mediaquery2;
    	let t2;
    	let mediaquery3;
    	let t3;
    	let if_block_anchor;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(max-width:480px)",
    				$$slots: {
    					default: [
    						create_default_slot_3,
    						({ matches }) => ({ 9: matches }),
    						({ matches }) => matches ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ matches }) => ({ 9: matches }),
    						({ matches }) => matches ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery2 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ matches }) => ({ 9: matches }),
    						({ matches }) => matches ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery3 = new MediaQuery({
    			props: {
    				query: "(max-width:480px)",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ matches }) => ({ 9: matches }),
    						({ matches }) => matches ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*$gameState*/ ctx[0] == "start-game" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(mediaquery0.$$.fragment);
    			t0 = space();
    			create_component(mediaquery1.$$.fragment);
    			t1 = space();
    			create_component(mediaquery2.$$.fragment);
    			t2 = space();
    			create_component(mediaquery3.$$.fragment);
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mediaquery0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(mediaquery1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(mediaquery2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(mediaquery3, target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, matches*/ 1536) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, matches*/ 1536) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    			const mediaquery2_changes = {};

    			if (dirty & /*$$scope, $gameState, $finalWords, $finalScore, matches*/ 1543) {
    				mediaquery2_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery2.$set(mediaquery2_changes);
    			const mediaquery3_changes = {};

    			if (dirty & /*$$scope, $gameState, $finalWords, $finalScore, matches*/ 1543) {
    				mediaquery3_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery3.$set(mediaquery3_changes);

    			if (/*$gameState*/ ctx[0] == "start-game") {
    				if (if_block) {
    					if (dirty & /*$gameState*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			transition_in(mediaquery2.$$.fragment, local);
    			transition_in(mediaquery3.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			transition_out(mediaquery2.$$.fragment, local);
    			transition_out(mediaquery3.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mediaquery0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(mediaquery1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(mediaquery2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(mediaquery3, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $gameState;
    	let $finalWords;
    	let $finalScore;
    	validate_store(gameState, 'gameState');
    	component_subscribe($$self, gameState, $$value => $$invalidate(0, $gameState = $$value));
    	validate_store(finalWords, 'finalWords');
    	component_subscribe($$self, finalWords, $$value => $$invalidate(1, $finalWords = $$value));
    	validate_store(finalScore, 'finalScore');
    	component_subscribe($$self, finalScore, $$value => $$invalidate(2, $finalScore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setGameState("disconnected");
    	const click_handler_1 = () => setGameState("rules");
    	const click_handler_2 = () => setGameState("winners");
    	const click_handler_3 = () => setGameState("disconnected");
    	const click_handler_4 = () => setGameState("rules");
    	const click_handler_5 = () => setGameState("winners");

    	$$self.$capture_state = () => ({
    		gameState,
    		finalScore,
    		finalWords,
    		setGameState,
    		Finish,
    		Winners,
    		Rules,
    		Home,
    		Starting,
    		MediaQuery,
    		Waiting,
    		Game,
    		$gameState,
    		$finalWords,
    		$finalScore
    	});

    	return [
    		$gameState,
    		$finalWords,
    		$finalScore,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
