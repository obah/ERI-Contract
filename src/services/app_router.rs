use axum::Router;
use axum::routing::{get, post};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use crate::config::swagger_config::ApiDoc;
use crate::models::router_path::RouterPath;
use crate::services::certificate_service::{generate_signature, manufacturer_registers, verify_authenticity, get_owner, verify_signature, create_certificate};
use crate::utility::AppState;

pub fn paths(state: AppState, path: RouterPath) -> Router {
    let app = Router::new()
        .route(&path.generate_signature, post(generate_signature))
        .route(&path.verify_authenticity, post(verify_authenticity))
        .route(&path.sign_up, post(manufacturer_registers))        
        .route(&path.get_owner, get(get_owner))        
        .route(&path.verify_signature, post(verify_signature))
        .route(&path.create_certificate, post(create_certificate))
        .merge(SwaggerUi::new("/swagger-ui")
            .url("/api-docs/openapi.json", ApiDoc::openapi()))
        .with_state(state)
        .layer(CorsLayer::permissive()); // Optional: Enable CORS

    app
}