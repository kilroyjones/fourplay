# Fourplay game

## Overview

Fourplay is a four player word puzzle game I built as a project to learn a bit more about Rust, Actix and Svelte. I also wanted to learn more about the actor model and try my hand at building something with it. I ended up rebuilding the backend a few times as I figured out better how to structure things, and while the current iteration is just that, an iteration, it works well enough for what it needs to do.

Note: The backend is fairly well structured, in my opinion, but the frontend could use some work. Due to the nature of the project a lot of the heavy lifting is done in the stores, which make it a bit difficult to follow when looking at individual components.

## Getting it to run locally

### Server

To run the server you will need to [install rust](https://doc.rust-lang.org/book/ch01-01-installation.html). Once installed check that cargo is working at the command line:

```bash
cargo version
```

Should give you a version of 1.56 or something close to.

Clone this repo, go to the server folder, and run:

```bash
cargo build
```

This might take awhile the first time as the initial packages install, but after that it should be relatively quick if any changes to the code are made.

Once that is finished, you'll want to create a **.env** file, which sets the environment variables and enter the following:

```bash
RUST_LOG=info
DATABASE_URL=sqlite://game.db
```

This will set the log level, which means anything info and above will be output. The levels are Error, Warn, Info, Debug, and Trace, so with the given setting you'll see Error, Warn, and Info. Most everything is set to Debug right now so I can monitor what's happening while it's running.

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

To view the game you'll need to continue on and setup the client

### Client

Getting the client running is a bit easier than the server.

Go to the client folder and type:

```bash
npm install
```

That should install the necessary modules. You should then be able to run the following go to **http://localhost::8080** in order to run it.

```bash
npm run dev
```
