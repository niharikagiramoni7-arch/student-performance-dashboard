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

    @Value("${spring.datasource.url:}")
    private String mysqlUrl;

    @Value("${spring.datasource.username:}")
    private String mysqlUser;

    @Value("${spring.datasource.password:}")
    private String mysqlPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String mysqlDriver;

    @Value("${MYSQL_URL:}")
    private String mysqlUrlEnv;

    @Value("${DATABASE_URL:}")
    private String databaseUrlEnv;

    @Bean
    @Primary
    public DataSource dataSource() {
        String finalUrl = mysqlUrl;
        String finalUser = mysqlUser;
        String finalPassword = mysqlPassword;

        // Check if a full database URI (e.g. mysql://user:pass@host:port/db?ssl-mode=REQUIRED) was provided
        String candidateUri = "";
        if (mysqlUrlEnv != null && !mysqlUrlEnv.isBlank() && !mysqlUrlEnv.contains("your-")) {
            candidateUri = mysqlUrlEnv.trim();
        } else if (databaseUrlEnv != null && !databaseUrlEnv.isBlank() && !databaseUrlEnv.contains("your-")) {
            candidateUri = databaseUrlEnv.trim();
        } else if (finalUrl != null && finalUrl.startsWith("mysql://")) {
            candidateUri = finalUrl.trim();
        }

        if (!candidateUri.isBlank() && candidateUri.startsWith("mysql://")) {
            try {
                java.net.URI uri = new java.net.URI(candidateUri.replace("mysql://", "http://"));
                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    finalUser = userParts[0];
                    if (userParts.length > 1) {
                        finalPassword = userParts[1];
                    }
                }
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 3306;
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "defaultdb";

                StringBuilder jdbcBuilder = new StringBuilder("jdbc:mysql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append("/")
                        .append(dbName)
                        .append("?");

                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    query = query.replace("ssl-mode=", "sslMode=");
                    jdbcBuilder.append(query);
                    if (!query.contains("serverTimezone")) {
                        jdbcBuilder.append("&serverTimezone=UTC");
                    }
                } else {
                    jdbcBuilder.append("sslMode=REQUIRED&serverTimezone=UTC");
                }
                if (!jdbcBuilder.toString().contains("allowPublicKeyRetrieval")) {
                    jdbcBuilder.append("&allowPublicKeyRetrieval=true");
                }
                finalUrl = jdbcBuilder.toString();
                log.info("Parsed MySQL connection URI for host: {} on port: {}", host, port);
            } catch (Exception e) {
                log.warn("Failed to parse candidate MySQL URI: {}. Proceeding with default properties.", e.getMessage());
            }
        }

        log.info("Checking primary MySQL connection at: {}", finalUrl);
        boolean mysqlAvailable = false;
        try {
            Class.forName(mysqlDriver);
            // Quick 3-second timeout probe
            DriverManager.setLoginTimeout(3);
            try (Connection conn = DriverManager.getConnection(finalUrl, finalUser, finalPassword)) {
                if (conn.isValid(3)) {
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
                    .url(finalUrl)
                    .username(finalUser)
                    .password(finalPassword)
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
