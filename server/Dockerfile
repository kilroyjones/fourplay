FROM rust:latest AS builder 

RUN apt update \
    && apt install -y openssl ca-certificates \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/* 
RUN apt-get -y update
RUN apt-get -y upgrade
RUN update-ca-certificates
RUN apt-get install -y sqlite3 libsqlite3-dev

# COPY Cargo.toml Cargo.toml

# RUN mkdir src/

# RUN echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs

# # RUN RUSTFLAGS=-Clinker=musl-gcc cargo build --release --target=x86_64-unknown-linux-musl

# RUN rm -f target/release/game-server*

COPY . .

# RUN RUSTFLAGS=-Clinker=musl-gcc cargo build --release --target=x86_64-unknown-linux-musl
# X86_64_UNKNOWN_LINUX_MUSL_OPENSSL_LIB_DIR

RUN cargo build --release

RUN ./reset_db.sh

# # ------------------------------------------------------------------------------
# # Final Stage
# # ------------------------------------------------------------------------------

# FROM alpine:latest

# COPY --from=builder ./target/release/game-server .
# COPY --from=builder ./target/release/game.db .
# COPY --from=builder ./wordlist.txt .


# FROM rustlang/rust:nightly as builder

# RUN apt update \
#     && apt install -y openssl ca-certificates \
#     && apt clean \
#     && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# RUN apt-get -y update
# RUN apt-get -y upgrade
# RUN apt-get install -y sqlite3 libsqlite3-dev

# WORKDIR /app/src
# RUN USER=root cargo new --bin game-server 
# COPY Cargo.toml Cargo.lock ./game-server/

# WORKDIR /app/src/game-server
# RUN cargo build --release

# COPY ./ ./
# RUN cargo build --release
# RUN ./reset_db.sh

# FROM debian:stable-slim
# WORKDIR /app

# EXPOSE 80 443 3080

# COPY --from=builder /app/src/game-server/target/release/game-server /app/game-server
# COPY --from=builder /app/src/game-server/target/release/game.db /app/game.db
# COPY --from=builder /app/src/game-server/wordlist.txt /app/wordlist.txt

# CMD ["/app/game-server"]
