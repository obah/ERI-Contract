mod controller;

use crate::controller::server;

#[tokio::main]
async fn main() {

    server().await.expect("Error!");

}