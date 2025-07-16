package com.example.backendjava;

import com.typedb.driver.api.Credentials;
import com.typedb.driver.api.Driver;
import com.typedb.driver.api.DriverOptions;
import com.typedb.driver.TypeDB;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TypeDBConfig {
    @Bean
    public Driver typeDBDriver() {
        return TypeDB.driver("localhost:1729", new Credentials("admin", "password"), new DriverOptions(false, null));
    }
} 
