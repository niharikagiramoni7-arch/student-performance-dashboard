package com.studentdashboard.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUser;

    @Value("${spring.datasource.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.driver-class-name}")
    private String mysqlDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Checking primary MySQL connection at: {}", mysqlUrl);
        boolean mysqlAvailable = false;
        try {
            Class.forName(mysqlDriver);
            // Quick 2-second timeout probe
            DriverManager.setLoginTimeout(2);
            try (Connection conn = DriverManager.getConnection(mysqlUrl, mysqlUser, mysqlPassword)) {
                if (conn.isValid(2)) {
                    mysqlAvailable = true;
                    log.info("Successfully connected to MySQL database!");
                }
            }
        } catch (Exception e) {
            log.warn("MySQL connection attempt failed: {}. Falling back to embedded H2 (MySQL mode) for zero downtime.", e.getMessage());
        }

        if (mysqlAvailable) {
            return DataSourceBuilder.create()
                    .driverClassName(mysqlDriver)
                    .url(mysqlUrl)
                    .username(mysqlUser)
                    .password(mysqlPassword)
                    .build();
        } else {
            log.info("Initializing in-memory H2 database with MySQL compatibility mode...");
            return DataSourceBuilder.create()
                    .driverClassName("org.h2.Driver")
                    .url("jdbc:h2:mem:student_performance_db;DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH")
                    .username("sa")
                    .password("")
                    .build();
        }
    }
}
