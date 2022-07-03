# Fourplay game server

## Overview

A websocket server built for [fourplay](https://fourplay.fun), a word puzzle game. It's a work in progress, though is currently functioning mostly as intended. The client is not included in this repo. It's a bit less organized at the moment.

The server utilizes the actor model, and makes user of four actors:

- websocket (one per connection is created)
- server (only one is created)
- game (one per game is created)
- database (only one is created)

## Running it locally

The process for connecting to the server is done through **localhost:3080/connect** which is handled in **main.rs**. It's as follows:

- The server is started and server actor is created.
- Upon a "connect" message, a websocket actor (websocket.rs and actors/websocket_actor.rs) is created and passed a reference of the server actor.
- The websocket actor assigns the connection a Uuid and sends a message to the server actor with said users info.
- The server actor attempts to assign them to the current game. If no game exists, it creates one.
- The server actor sends the game actor the user information.
- The game actor determines if there are enough players. If so, then start the game, if not, continue to wait.
- Game actor sends the server confirmation of the join.
- Once four players are reached the game will start and users are sent the board.
- When finished the game actor will send a message to the server actor which stops that actor.

## Setup

To run the server you will need to [install rust](https://doc.rust-lang.org/book/ch01-01-installation.html). Once installed check that cargo is working at the command line:

```bash
cargo version
```

Should give you a version of 1.56 or something close to.

Clone this repo and then run:

```bash
cargo build
```

This might take awhile the first time as the initial packages install, but after that it should be relatively quick if any changes to the code are made.

Once that is finished, you'll want to create a **.env** file, which sets the environment variables and enter the following.

```bash
RUST_LOG=info
DATABASE_URL=sqlite://game.db
```

This will set the log level, which means anything info and above will be output. The levels are Error, Warn, Info, Debug, and Trace, so with the given setting you'll see Error, Warn, and Info. Most everything is set to Info right now so I can monitor what's happening while it's running.

You'll then need to create the database in the root folder:

```bash
sqlite3 game.db < db.schema
```

It will be empty at this point so you'll want to create some games to load. You can do that using the **builder** in the **bin** folder. Run the following:

```bash
cargo run --bin builder > loaddb.sql
```

This will create an sql file you can use to load games from the sqlite prompt.

After that you should be able to run (server will not run at this point):

```bash
cargo run --bin game-server
```

The server should run after, but it's set up for only that and you can try to navigate to **http://localhost:3080/connect** and if you should see an error as follows:

```bash
ERROR game_server] No user name provided in request
```
