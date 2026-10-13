package com.studentdashboard;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.awt.Desktop;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class StudentPerformanceApplication {

    private static final Logger log = LoggerFactory.getLogger(StudentPerformanceApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(StudentPerformanceApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] possiblePaths = new Path[]{
                Paths.get(".env"),
                Paths.get(".env.example"),
                Paths.get("../.env"),
                Paths.get("../.env.example"),
                Paths.get(System.getProperty("user.dir"), ".env"),
                Paths.get(System.getProperty("user.dir"), ".env.example")
        };
        for (Path p : possiblePaths) {
            if (Files.exists(p)) {
                try {
                    List<String> lines = Files.readAllLines(p, StandardCharsets.UTF_8);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();

                            // Strip inline comments if value is not quoted
                            if (!val.startsWith("\"") && !val.startsWith("'")) {
                                int hashIdx = val.indexOf('#');
                                if (hashIdx >= 0) {
                                    val = val.substring(0, hashIdx).trim();
                                }
                            }

                            // Strip surrounding single or double quotes
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1).trim();
                            }

                            // Google app passwords / API keys: strip all whitespace
                            if ("RESEND_API_KEY".equalsIgnoreCase(key) || "BREVO_API_KEY".equalsIgnoreCase(key) || "EMAIL_APP_PASSWORD".equalsIgnoreCase(key) || "SMTP_PASSWORD".equalsIgnoreCase(key)) {
                                val = val.replaceAll("\\s+", "");
                            }

                            // If we already have a valid non-placeholder value for this key, don't overwrite with a placeholder
                            String existing = System.getProperty(key);
                            boolean isNewValPlaceholder = val.isBlank() || val.contains("your_");
                            if (existing != null && !existing.isBlank() && !existing.contains("your_") && isNewValPlaceholder) {
                                continue;
                            }

                            // Always set system property
                            System.setProperty(key, val);

                            // Directly bind Resend, Brevo & Mail properties so no external environment variable overrides them
                            if ("RESEND_API_KEY".equalsIgnoreCase(key)) {
                                System.setProperty("RESEND_API_KEY", val);
                                System.setProperty("app.mail.resend-api-key", val);
                            } else if ("BREVO_API_KEY".equalsIgnoreCase(key)) {
                                System.setProperty("BREVO_API_KEY", val);
                                System.setProperty("app.mail.brevo-api-key", val);
                            } else if ("EMAIL_FROM".equalsIgnoreCase(key)) {
                                System.setProperty("EMAIL_FROM", val);
                                System.setProperty("app.mail.from-email", val);
                            } else if ("EMAIL_FROM_NAME".equalsIgnoreCase(key)) {
                                System.setProperty("EMAIL_FROM_NAME", val);
                                System.setProperty("app.mail.from-name", val);
                            } else if ("EMAIL_USER".equalsIgnoreCase(key) || "SMTP_USER".equalsIgnoreCase(key)) {
                                System.setProperty("spring.mail.username", val);
                            } else if ("EMAIL_APP_PASSWORD".equalsIgnoreCase(key) || "SMTP_PASSWORD".equalsIgnoreCase(key)) {
                                System.setProperty("spring.mail.password", val);
                            } else if ("SMTP_HOST".equalsIgnoreCase(key)) {
                                System.setProperty("spring.mail.host", val);
                            } else if ("SMTP_PORT".equalsIgnoreCase(key)) {
                                System.setProperty("spring.mail.port", val);
                            } else if ("ADMIN_EMAIL".equalsIgnoreCase(key)) {
                                System.setProperty("ADMIN_EMAIL", val);
                                System.setProperty("app.security.admin-email", val);
                            } else if ("ADMIN_PASSWORD".equalsIgnoreCase(key)) {
                                System.setProperty("ADMIN_PASSWORD", val);
                                System.setProperty("app.security.admin-password", val);
                            }
                        }
                    }
                    log.info("Loaded environment configuration from {}", p.toAbsolutePath());
                } catch (Exception e) {
                    log.warn("Failed to parse env file at {}: {}", p, e.getMessage());
                }
            }
        }
    }

    @Bean
    public CommandLineRunner printServerUrl() {
        return args -> {
            String url = "http://localhost:8080/role-selection.html";
            System.out.println();
            System.out.println("==================================================================================");
            System.out.println("🎉 STUDENT PERFORMANCE DASHBOARD IS ONLINE!");
            System.out.println("👉 ACCESS PORTAL URL: " + url);
            System.out.println("----------------------------------------------------------------------------------");
            System.out.println("🔗 Portal Links:");
            System.out.println("   • Gateway:       http://localhost:8080/role-selection.html");
            System.out.println("   • Student Login: http://localhost:8080/student/login.html");
            System.out.println("   • Faculty Login: http://localhost:8080/faculty/login.html");
            System.out.println("   • Admin Login:   http://localhost:8080/admin/login.html");
            System.out.println("==================================================================================");
            System.out.println();

            // Auto-launch default browser on server start
            try {
                String os = System.getProperty("os.name", "").toLowerCase();
                if (os.contains("win")) {
                    Runtime.getRuntime().exec(new String[]{"rundll32", "url.dll,FileProtocolHandler", url});
                } else if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                    Desktop.getDesktop().browse(new URI(url));
                }
            } catch (Exception e) {
                log.debug("Auto-browser open skipped: {}", e.getMessage());
            }
        };
    }
}
