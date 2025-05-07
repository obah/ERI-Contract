use crate::server::server;

mod config;
mod models;
mod qr_code;
mod server;
mod services;
mod utility;

#[tokio::main]
async fn main() {
    server().await.expect("Error!");
}
