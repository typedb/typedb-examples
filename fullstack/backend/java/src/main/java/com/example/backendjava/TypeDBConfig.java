package com.example.backendjava;

import com.typedb.driver.api.Credentials;
import com.typedb.driver.api.Driver;
import com.typedb.driver.api.DriverOptions;
import com.typedb.driver.TypeDB;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TypeDBConfig {
    private Map<String, String> env = System.getenv();
    private String TYPEDB_ADDRESS = env.getOrDefault("TYPEDB_ADDRESS", "localhost:1729");
    private String TYPEDB_USERNAME = env.getOrDefault("TYPEDB_USERNAME", "admin");
    private String TYPEDB_PASSWORD = env.getOrDefault("TYPEDB_PASSWORD", "password");
    private boolean TYPEDB_TLS_ENABLED = env.getOrDefault("TYPEDB_TLS_ENABLED", "false") == "true";
    public String TYPEDB_DATABASE = env.getOrDefault("TYPEDB_DATABASE", "social-network");

    @Bean
    public Driver typeDBDriver() {
        return TypeDB.driver(TYPEDB_ADDRESS, new Credentials(TYPEDB_USERNAME, TYPEDB_PASSWORD), new DriverOptions(TYPEDB_TLS_ENABLED, null));
    }
} 
