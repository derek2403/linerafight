FROM rustlang/rust:nightly

RUN apt-get update && apt-get install -y clang pkg-config libssl-dev git

WORKDIR /app

RUN rustup target add wasm32-unknown-unknown
RUN rustup component add rust-src

# Use -Z build-std to recompile libstd with MVP settings
# This is the only reliable way to remove memory.copy/memory.fill from the standard library
CMD RUSTFLAGS="-C target-cpu=mvp -C target-feature=-bulk-memory -C target-feature=-sign-ext -C target-feature=-nontrapping-fptoint" \
    cargo build -Z build-std=std,panic_abort \
    --release --target wasm32-unknown-unknown
