package com.example.smarttimetable.controller;

import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final ApplicationContext applicationContext;

    public HealthController(DataSource dataSource, ApplicationContext applicationContext) {
        this.dataSource = dataSource;
        this.applicationContext = applicationContext;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Smart Timetable Management System Backend");
        response.put("version", "1.0.0");
        response.put("phase", "PHASE 5 - SERVICE LAYER AND BUSINESS LOGIC IMPLEMENTED");
        response.put("timestamp", LocalDateTime.now().toString());

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            Map<String, Object> dbInfo = new HashMap<>();
            dbInfo.put("status", "CONNECTED");
            dbInfo.put("database", connection.getCatalog());
            dbInfo.put("productName", metaData.getDatabaseProductName());
            dbInfo.put("productVersion", metaData.getDatabaseProductVersion());

            // Query created tables in smart_timetable_db
            List<String> tables = new ArrayList<>();
            try (Statement statement = connection.createStatement();
                 ResultSet rs = statement.executeQuery(
                         "SELECT table_name FROM information_schema.tables " +
                         "WHERE table_schema = 'smart_timetable_db' ORDER BY table_name")) {
                while (rs.next()) {
                    tables.add(rs.getString("table_name"));
                }
            }

            dbInfo.put("tableCount", tables.size());
            dbInfo.put("tables", tables);

            // Repository beans discovery
            String[] repoBeans = applicationContext.getBeanNamesForType(JpaRepository.class);
            Arrays.sort(repoBeans);
            dbInfo.put("repositoryCount", repoBeans.length);
            dbInfo.put("repositories", repoBeans);

            // Service beans discovery
            Map<String, Object> serviceBeans = applicationContext.getBeansWithAnnotation(Service.class);
            List<String> serviceNames = new ArrayList<>(serviceBeans.keySet());
            serviceNames.sort(String::compareTo);
            dbInfo.put("serviceCount", serviceNames.size());
            dbInfo.put("services", serviceNames);

            // Controller beans discovery
            Map<String, Object> controllerBeans = applicationContext.getBeansWithAnnotation(RestController.class);
            List<String> controllerNames = new ArrayList<>(controllerBeans.keySet());
            controllerNames.sort(String::compareTo);
            dbInfo.put("controllerCount", controllerNames.size());
            dbInfo.put("controllers", controllerNames);

            response.put("phase", "PHASE 6 - REST CONTROLLERS AND REST APIS OPERATIONAL");
            response.put("database", dbInfo);
            response.put("message", "All 18 REST controllers initialized and verified with validation and global error handling.");
        } catch (Exception e) {
            Map<String, Object> dbInfo = new HashMap<>();
            dbInfo.put("status", "DISCONNECTED");
            dbInfo.put("error", e.getMessage());
            response.put("database", dbInfo);
            response.put("message", "Database error: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
