rm game.db
cargo run --bin builder > puzzles.sql
sqlite3 game.db < db.schema
sqlite3 game.db < puzzles.sql
cp game.db ./target/release/game.db
