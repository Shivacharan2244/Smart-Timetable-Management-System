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
 * 1. If a cloud/remote database is specified in SPRING_DATASOURCE_URL or DATABASE_URL, connects to it.
 * 2. If running locally with MySQL on localhost:3306, connects to local MySQL.
 * 3. If deployed on Render/container without an external database (localhost:3306 closed),
 *    automatically falls back to persistent embedded H2 (MySQL mode) so the server never crashes.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:root}")
    private String password;

    @Value("${spring.datasource.driver-class-name:}")
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

        String targetUrl = configuredUrl != null ? configuredUrl.trim() : "";
        String targetDriver = configuredDriver != null ? configuredDriver.trim() : "";
        String targetUser = username;
        String targetPass = password;

        boolean useH2 = false;

        if (targetUrl.isEmpty()) {
            if (isPortOpen("127.0.0.1", 3306, 1200)) {
                targetUrl = "jdbc:mysql://localhost:3306/smart_timetable_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8";
                targetDriver = "com.mysql.cj.jdbc.Driver";
                log.info("✓ Detected local MySQL active at localhost:3306.");
            } else {
                useH2 = true;
                log.warn("⚠️ No local MySQL on localhost:3306. Falling back to embedded H2 database for zero-config deployment.");
            }
        } else if (targetUrl.contains("localhost:3306") || targetUrl.contains("127.0.0.1:3306")) {
            if (!isPortOpen("127.0.0.1", 3306, 1200)) {
                useH2 = true;
                log.warn("⚠️ Configured URL is localhost:3306 but port 3306 is unreachable (e.g. Render). Falling back to embedded H2 database.");
            }
        }

        if (useH2 || targetUrl.startsWith("jdbc:h2:")) {
            File dataDir = new File("./data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            targetUrl = "jdbc:h2:file:./data/smart_timetable_db;DB_CLOSE_DELAY=-1;MODE=MySQL;NON_KEYWORDS=USER";
            targetDriver = "org.h2.Driver";
            targetUser = "sa";
            targetPass = "";
            config.setConnectionTestQuery("SELECT 1");
            log.info("✓ Using persistent embedded H2 database: {}", targetUrl);
        } else {
            config.setConnectionTestQuery("SELECT 1");
            log.info("✓ Connecting to MySQL database: {}", targetUrl);
        }

        config.setJdbcUrl(targetUrl);
        if (!targetDriver.isEmpty()) {
            config.setDriverClassName(targetDriver);
        }
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
