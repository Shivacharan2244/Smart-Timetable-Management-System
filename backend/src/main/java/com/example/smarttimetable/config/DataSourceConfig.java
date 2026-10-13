package com.example.smarttimetable.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.net.InetSocketAddress;
import java.net.Socket;

/**
 * Intelligent DataSource Configuration:
 * 1. Remote/Cloud MySQL: Connects directly when SPRING_DATASOURCE_URL or DATABASE_URL is configured.
 * 2. Local MySQL: Connects directly to local MySQL on localhost:3306 when running on developer machine.
 * 3. Cloud (e.g. Render) Fallback: When deployed on Render without a configured external MySQL instance
 *    (port 3306 unreachable), automatically falls back to persistent embedded database in MySQL mode so
 *    the deployment never crashes with 'Connection refused'.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/smart_timetable_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8}")
    private String configuredUrl;

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:root}")
    private String password;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String configuredDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setPoolName("SmartTimetableHikariPool");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1200000);
        config.setConnectionTimeout(30000);

        String targetUrl = (configuredUrl != null && !configuredUrl.isBlank()) ? configuredUrl.trim() : "";
        String targetDriver = (configuredDriver != null && !configuredDriver.isBlank()) ? configuredDriver.trim() : "com.mysql.cj.jdbc.Driver";
        String targetUser = username;
        String targetPass = password;

        boolean isLocalHost = targetUrl.contains("localhost:3306") || targetUrl.contains("127.0.0.1:3306");
        boolean useFallback = false;

        if (isLocalHost) {
            // Check if local MySQL port 3306 is actually reachable
            if (isPortOpen("127.0.0.1", 3306, 1500) || isPortOpen("localhost", 3306, 1500)) {
                log.info("✓ Local MySQL detected active on localhost:3306. Connecting to MySQL database: {}", targetUrl);
            } else {
                useFallback = true;
                log.warn("⚠️ Local MySQL (localhost:3306) unreachable (e.g. Render container without external DB). " +
                        "Switching to embedded persistent database fallback so deploy remains online.");
            }
        } else if (targetUrl.startsWith("jdbc:h2:")) {
            useFallback = true;
        } else {
            log.info("✓ Connecting to external MySQL database: {}", targetUrl);
        }

        if (useFallback) {
            File dataDir = new File("./data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            targetUrl = "jdbc:h2:file:./data/smart_timetable_db;DB_CLOSE_DELAY=-1;MODE=MySQL;NON_KEYWORDS=USER";
            targetDriver = "org.h2.Driver";
            targetUser = "sa";
            targetPass = "";
            config.setConnectionTestQuery("SELECT 1");
            log.info("✓ Using persistent embedded database fallback: {}", targetUrl);
        } else {
            config.setConnectionTestQuery("SELECT 1");
        }

        config.setJdbcUrl(targetUrl);
        config.setDriverClassName(targetDriver);
        config.setUsername(targetUser);
        config.setPassword(targetPass);

        return new HikariDataSource(config);
    }

    private boolean isPortOpen(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
