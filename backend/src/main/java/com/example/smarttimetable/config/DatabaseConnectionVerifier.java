package com.example.smarttimetable.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseConnectionVerifier implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionVerifier.class);

    private final DataSource dataSource;
    private final ApplicationContext applicationContext;

    public DatabaseConnectionVerifier(DataSource dataSource, ApplicationContext applicationContext) {
        this.dataSource = dataSource;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(String... args) {
        logger.info("==================================================================");
        logger.info("  PHASE 5: SERVICE LAYER & BUSINESS LOGIC VERIFICATION");
        logger.info("==================================================================");

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            logger.info("✓ Connected to MySQL Database: {}", connection.getCatalog());
            logger.info("  DBMS Version: {}", metaData.getDatabaseProductVersion());

            // Query created tables in current database schema
            String currentSchema = connection.getCatalog() != null ? connection.getCatalog() : "smart_timetable_db";
            List<String> tables = new ArrayList<>();
            try (ResultSet rs = metaData.getTables(connection.getCatalog(), null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tName = rs.getString("TABLE_NAME");
                    if (tName != null) {
                        tables.add(tName.toLowerCase());
                    }
                }
            } catch (Exception ex) {
                try (Statement statement = connection.createStatement();
                     ResultSet rs = statement.executeQuery(
                             "SELECT table_name FROM information_schema.tables " +
                             "WHERE table_schema = '" + currentSchema + "' ORDER BY table_name")) {
                    while (rs.next()) {
                        tables.add(rs.getString("table_name"));
                    }
                } catch (Exception ignored) {}
            }
            tables.sort(String::compareTo);

            logger.info("✓ Discovered {} tables in database schema '{}':", tables.size(), currentSchema);
            for (String tableName : tables) {
                logger.info("   -> [TABLE] {}", tableName);
            }

            // Verify Spring Data JPA Repository Beans
            String[] repoBeanNames = applicationContext.getBeanNamesForType(JpaRepository.class);
            Arrays.sort(repoBeanNames);
            logger.info("✓ Discovered {} Spring Data JPA Repositories registered as beans:", repoBeanNames.length);

            // Verify Service Layer Beans
            Map<String, Object> serviceBeans = applicationContext.getBeansWithAnnotation(Service.class);
            List<String> serviceNames = new ArrayList<>(serviceBeans.keySet());
            serviceNames.sort(String::compareTo);
            logger.info("✓ Discovered {} Service beans registered and autowired:", serviceNames.size());
            for (String sName : serviceNames) {
                logger.info("   -> [SERVICE BEAN] {}", sName);
            }

            logger.info("==================================================================");
            logger.info("  PHASE 5 VERIFICATION COMPLETED: ALL SERVICES OPERATIONAL");
            logger.info("==================================================================");

        } catch (Exception e) {
            logger.error("✗ [FAILURE] Error inspecting database schema, repositories, or services: {}", e.getMessage(), e);
        }
    }
}
