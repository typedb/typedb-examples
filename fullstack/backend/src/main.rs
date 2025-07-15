use std::{net::SocketAddr, sync::Arc};

use axum::{
    Json, Router,
    body::Bytes,
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
};
use base64::{Engine as _, engine::general_purpose::URL_SAFE};
use futures::{StreamExt, TryStreamExt};
use serde::Deserialize;
use serde_json::value::RawValue;
use serde_with::{NoneAsEmptyString, serde_as};
use tower_http::cors::{Any, CorsLayer};
use typedb_driver::{Credentials, DriverOptions, TransactionType, TypeDBDriver};

mod query;

async fn get_page_list(State(driver): State<Arc<TypeDBDriver>>) -> Json<Vec<Box<RawValue>>> {
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

async fn get_location_page_list(
    State(driver): State<Arc<TypeDBDriver>>,
    Path(place_id): Path<String>,
) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::location_query(&place_id)).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|doc| RawValue::from_string(doc.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

async fn get_profile(State(driver): State<Arc<TypeDBDriver>>, Path(id): Path<String>) -> Json<Option<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::page_query(&id)).await.unwrap();
    let doc = result.into_documents().next().await;
    Json(doc.map(|doc| RawValue::from_string(doc.unwrap().into_json().to_string()).unwrap()))
}

async fn get_media(Path(_id): Path<String>) -> impl IntoResponse {
    (StatusCode::NOT_FOUND, ())
}

async fn post_media(State(driver): State<Arc<TypeDBDriver>>, headers: HeaderMap, bytes: Bytes) -> impl IntoResponse {
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

async fn get_posts(
    State(driver): State<Arc<TypeDBDriver>>,
    Query(PostQuery { page_id }): Query<PostQuery>,
) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::posts_query(&page_id)).await.unwrap();
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

async fn get_comments(
    State(driver): State<Arc<TypeDBDriver>>,
    Query(CommentQuery { post_id }): Query<CommentQuery>,
) -> Json<Vec<Box<RawValue>>> {
    let transaction = driver.transaction("social-network", TransactionType::Read).await.unwrap();
    let result = transaction.query(query::comments_query(&post_id)).await.unwrap();
    Json(
        result
            .into_documents()
            .map_ok(|doc| RawValue::from_string(doc.into_json().to_string()).unwrap())
            .try_collect::<Vec<_>>()
            .await
            .unwrap(),
    )
}

#[serde_as]
#[derive(Debug, Deserialize)]
struct CreateUserPayload {
    username: String,
    name: String,
    #[serde_as(as = "NoneAsEmptyString")]
    profile_picture: Option<String>,
    #[serde_as(as = "NoneAsEmptyString")]
    badge: Option<String>,
    is_active: bool,
    gender: String,
    #[serde_as(as = "NoneAsEmptyString")]
    language: Option<String>,
    email: String,
    #[serde_as(as = "NoneAsEmptyString")]
    phone: Option<String>,
    #[serde_as(as = "NoneAsEmptyString")]
    relationship_status: Option<String>,
    can_publish: bool,
    page_visibility: String,
    post_visibility: String,
    bio: String,
}

async fn post_create_user(
    State(driver): State<Arc<TypeDBDriver>>,
    Json(payload): Json<CreateUserPayload>,
) -> impl IntoResponse {
    let transaction = driver.transaction("social-network", TransactionType::Write).await.unwrap();
    transaction
        .query(query::create_user_query(payload))
        .await
        .unwrap()
        .into_rows()
        .map_ok(drop)
        .try_collect::<()>()
        .await
        .unwrap();
    transaction.commit().await.unwrap();
    (StatusCode::OK, Json(RawValue::NULL.to_owned()))
}

#[serde_as]
#[derive(Debug, Deserialize)]
struct CreateGroupPayload {
    group_id: String,
    name: String,
    #[serde_as(as = "NoneAsEmptyString")]
    profile_picture: Option<String>,
    #[serde_as(as = "NoneAsEmptyString")]
    badge: Option<String>,
    is_active: bool,
    tags: Vec<String>,
    page_visibility: String,
    post_visibility: String,
    bio: String,
}

async fn post_create_group(
    State(driver): State<Arc<TypeDBDriver>>,
    Json(payload): Json<CreateGroupPayload>,
) -> impl IntoResponse {
    let transaction = driver.transaction("social-network", TransactionType::Write).await.unwrap();
    transaction
        .query(query::create_group_query(payload))
        .await
        .unwrap()
        .into_rows()
        .map_ok(drop)
        .try_collect::<()>()
        .await
        .unwrap();
    transaction.commit().await.unwrap();
    (StatusCode::OK, Json(RawValue::NULL.to_owned()))
}

#[serde_as]
#[derive(Debug, Deserialize)]
struct CreateOrganizationPayload {
    username: String,
    name: String,
    #[serde_as(as = "NoneAsEmptyString")]
    profile_picture: Option<String>,
    #[serde_as(as = "NoneAsEmptyString")]
    badge: Option<String>,
    is_active: bool,
    can_publish: bool,
    tags: Vec<String>,
    bio: String,
}

async fn post_create_organization(
    State(driver): State<Arc<TypeDBDriver>>,
    Json(payload): Json<CreateOrganizationPayload>,
) -> impl IntoResponse {
    let transaction = driver.transaction("social-network", TransactionType::Write).await.unwrap();
    transaction
        .query(query::create_organization_query(payload))
        .await
        .unwrap()
        .into_rows()
        .map_ok(drop)
        .try_collect::<()>()
        .await
        .unwrap();
    transaction.commit().await.unwrap();
    (StatusCode::OK, Json(RawValue::NULL.to_owned()))
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
        .route("/api/pages", get(get_page_list))
        .route("/api/create-user", post(post_create_user))
        .route("/api/create-organization", post(post_create_organization))
        .route("/api/create-group", post(post_create_group))
        .route("/api/location/{place_id}", get(get_location_page_list))
        .route("/api/user/{id}", get(get_profile))
        .route("/api/group/{id}", get(get_profile))
        .route("/api/organization/{id}", get(get_profile))
        .route("/api/posts", get(get_posts))
        .route("/api/comments", get(get_comments))
        .route("/api/media", post(post_media))
        .route("/api/media/{id}", get(get_media))
        .with_state(driver)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any));
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Backend running at http://{addr}");
    axum::serve(listener, app).await.unwrap();
}
