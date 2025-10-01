use std::env::var;

pub fn typedb_address() -> String {
    return var("TYPEDB_ADDRESS").unwrap_or("localhost:1729".to_string());
}
pub fn typedb_username() -> String {
    return var("TYPEDB_USERNAME").unwrap_or("admin".to_string());
}
pub fn typedb_password() -> String {
    return var("TYPEDB_PASSWORD").unwrap_or("password".to_string());
}
pub fn typedb_tls_enabled() -> bool {
    return var("TYPEDB_TLS_ENABLED").unwrap_or("false".to_string()).parse().unwrap();
}
pub fn typedb_database() -> String {
    return var("TYPEDB_DATABASE").unwrap_or("social-network".to_string());
}
