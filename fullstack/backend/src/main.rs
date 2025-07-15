use std::{net::SocketAddr, sync::Arc};

use axum::{
    Json, Router,
    body::Bytes,
    extract::{Path, Query},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
};
use base64::{Engine as _, engine::general_purpose::URL_SAFE};
use futures::{StreamExt, TryStreamExt};
use serde::Deserialize;
use serde_json::value::RawValue;
use tower_http::cors::{Any, CorsLayer};
use typedb_driver::{Credentials, DriverOptions, TransactionType, TypeDBDriver};

mod query;

async fn get_page_list(driver: &TypeDBDriver) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::PAGE_LIST_QUERY).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|page| RawValue::from_string(page.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

async fn get_location_page_list(driver: &TypeDBDriver, place_id: &str) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::location_query(place_id)).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|doc| RawValue::from_string(doc.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

async fn get_profile(driver: &TypeDBDriver, id: &str) -> Json<Option<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::profile_query(id)).await.unwrap();
    let doc = result.into_documents().next().await;
    Json(doc.map(|doc| RawValue::from_string(doc.unwrap().into_json().to_string()).unwrap()))
}

async fn get_media(Path(_id): Path<String>) -> impl IntoResponse {
    let bytes = include_bytes!("../../79.jpg");
    let mut headers = HeaderMap::new();
    headers.insert("Access-Control-Allow-Origin", "*".parse().unwrap());
    headers.insert("Content-Type", "image/jpeg".parse().unwrap());
    (StatusCode::OK, headers, bytes)
}

async fn post_media(driver: &TypeDBDriver, headers: HeaderMap, bytes: Bytes) -> impl IntoResponse + use<> {
    let data =
        format!("data:{};base64,{}", headers.get("Content-Type").unwrap().to_str().unwrap(), URL_SAFE.encode(bytes));
    dbg!(&data[..100]);
    (StatusCode::OK, Json(RawValue::from_string(r#"{"id": "123"}"#.into()).unwrap()))
}

#[derive(Debug, Deserialize)]
struct PostQuery {
    #[serde(rename = "pageId")]
    page_id: String,
}

async fn get_posts(driver: &TypeDBDriver, page_id: &str) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::posts_query(page_id)).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|doc| RawValue::from_string(doc.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

#[derive(Debug, Deserialize)]
struct CommentQuery {
    #[serde(rename = "postId")]
    post_id: String,
}

async fn get_comments(driver: &TypeDBDriver, post_id: &str) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::comments_query(post_id)).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|doc| RawValue::from_string(doc.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

#[tokio::main]
async fn main() {
    let driver = Arc::new(
        TypeDBDriver::new(
            "localhost:1729",
            Credentials::new("admin", "password"),
            DriverOptions::new(false, None).unwrap(),
        )
        .await
        .unwrap(),
    );
    let app = Router::new()
        .route(
            "/api/pages",
            get({
                let driver = driver.clone();
                async move || get_page_list(&driver).await
            }),
        )
        .route(
            "/api/location/{place_id}",
            get({
                let driver = driver.clone();
                async move |Path(place_id): Path<String>| get_location_page_list(&driver, &place_id).await
            }),
        )
        .route(
            "/api/user/{id}",
            get({
                let driver = driver.clone();
                async move |Path(id): Path<String>| get_profile(&driver, &id).await
            }),
        )
        .route(
            "/api/group/{id}",
            get({
                let driver = driver.clone();
                async move |Path(id): Path<String>| get_profile(&driver, &id).await
            }),
        )
        .route(
            "/api/organisation/{id}",
            get({
                let driver = driver.clone();
                async move |Path(id): Path<String>| get_profile(&driver, &id).await
            }),
        )
        .route(
            "/api/posts",
            get({
                let driver = driver.clone();
                async move |Query(PostQuery { page_id }): Query<PostQuery>| get_posts(&driver, &page_id).await
            }),
        )
        .route(
            "/api/comments",
            get({
                let driver = driver.clone();
                async move |Query(CommentQuery { post_id }): Query<CommentQuery>| get_comments(&driver, &post_id).await
            }),
        )
        .route(
            "/api/media",
            post({
                let driver = driver.clone();
                async move |headers: HeaderMap, bytes: Bytes| post_media(&driver, headers, bytes).await
            }),
        )
        .route("/api/media/{id}", get(get_media))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any));
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Backend running at http://{addr}");
    axum::serve(listener, app).await.unwrap();
}
