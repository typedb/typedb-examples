package com.example.backendjava;

import com.typedb.driver.api.Credentials;
import com.typedb.driver.api.Driver;
import com.typedb.driver.api.DriverOptions;
import com.typedb.driver.TypeDB;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TypeDBConfig {
    private static final String TYPEDB_ADDRESS = "localhost:1729";
    private static final String TYPEDB_USERNAME = "admin";
    private static final String TYPEDB_PASSWORD = "password";
    private static final boolean TYPEDB_TLS_ENABLED = false;
    public static final String TYPEDB_DATABASE = "social-network";

    @Bean
    public Driver typeDBDriver() {
        return TypeDB.driver(TYPEDB_ADDRESS, new Credentials(TYPEDB_USERNAME, TYPEDB_PASSWORD), new DriverOptions(TYPEDB_TLS_ENABLED, null));
    }
} 
