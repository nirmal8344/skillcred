package com.adz4needz.skillcred;

import com.adz4needz.skillcred.config.DataSourceConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class DataSourceConfigTest {

    @Test
    @DisplayName("Production mode must throw IllegalStateException if DATABASE_URL is empty")
    void testProductionFailsWhenDbUrlEmpty() {
        DataSourceConfig config = new DataSourceConfig();
        ReflectionTestUtils.setField(config, "environment", "production");
        ReflectionTestUtils.setField(config, "dbUrl", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateDatabaseConfig);
        assertTrue(ex.getMessage().contains("DATABASE_URL environment variable is required in production"));
    }

    @Test
    @DisplayName("Production mode must throw IllegalStateException if DATABASE_URL points to localhost")
    void testProductionFailsWhenDbUrlPointsToLocalhost() {
        DataSourceConfig config = new DataSourceConfig();
        ReflectionTestUtils.setField(config, "environment", "production");
        ReflectionTestUtils.setField(config, "dbUrl", "jdbc:postgresql://localhost:5432/skillcred_db");

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateDatabaseConfig);
        assertTrue(ex.getMessage().contains("points to localhost in production mode"));
    }

    @Test
    @DisplayName("Development mode allows localhost without throwing")
    void testDevAllowsLocalhost() {
        DataSourceConfig config = new DataSourceConfig();
        ReflectionTestUtils.setField(config, "environment", "development");
        ReflectionTestUtils.setField(config, "dbUrl", "jdbc:postgresql://localhost:5432/skillcred_db");

        assertDoesNotThrow(config::validateDatabaseConfig);
    }

    @Test
    @DisplayName("Production mode allows non-localhost cloud database URL")
    void testProductionAllowsCloudUrl() {
        DataSourceConfig config = new DataSourceConfig();
        ReflectionTestUtils.setField(config, "environment", "production");
        ReflectionTestUtils.setField(config, "dbUrl", "jdbc:postgresql://dpg-xxxx-a.render.com:5432/skillcred_db");

        assertDoesNotThrow(config::validateDatabaseConfig);
    }
}
