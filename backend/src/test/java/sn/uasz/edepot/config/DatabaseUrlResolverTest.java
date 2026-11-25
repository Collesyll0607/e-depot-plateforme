package sn.uasz.edepot.config;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseUrlResolverTest {

    @AfterEach
    void cleanupSystemProperties() {
        System.clearProperty("spring.datasource.url");
        System.clearProperty("spring.datasource.username");
        System.clearProperty("spring.datasource.password");
        System.clearProperty("spring.datasource.driver-class-name");
        System.clearProperty("spring.jpa.database-platform");
    }

    @Test
    void parseInternalRenderDatabaseUrl() {
        Optional<DatabaseUrlResolver.ResolvedDatasource> result = DatabaseUrlResolver.parsePostgresUrl(
                "postgresql://edepot_db_v2_user:Secret123@dpg-dc3g1jqjnfac73a19p1g-a/edepot_db_v2"
        );

        assertTrue(result.isPresent());
        DatabaseUrlResolver.ResolvedDatasource ds = result.get();
        assertEquals("jdbc:postgresql://dpg-dc3g1jqjnfac73a19p1g-a:5432/edepot_db_v2", ds.jdbcUrl());
        assertEquals("edepot_db_v2_user", ds.username());
        assertEquals("Secret123", ds.password());
        assertEquals("org.postgresql.Driver", ds.driverClassName());
    }

    @Test
    void parseExternalRenderDatabaseUrlAddsSslModeRequire() {
        Optional<DatabaseUrlResolver.ResolvedDatasource> result = DatabaseUrlResolver.parsePostgresUrl(
                "postgres://edepot_user:Pass%40Word%21@dpg-abc123-a.oregon-postgres.render.com:5432/edepot_db"
        );

        assertTrue(result.isPresent());
        DatabaseUrlResolver.ResolvedDatasource ds = result.get();
        assertEquals(
                "jdbc:postgresql://dpg-abc123-a.oregon-postgres.render.com:5432/edepot_db?sslmode=require",
                ds.jdbcUrl()
        );
        assertEquals("edepot_user", ds.username());
        assertEquals("Pass@Word!", ds.password());
    }

    @Test
    void parseExternalRenderUrlPreservesExistingQueryAndAddsSsl() {
        Optional<DatabaseUrlResolver.ResolvedDatasource> result = DatabaseUrlResolver.parsePostgresUrl(
                "postgresql://user:pass@dpg-abc-a.oregon-postgres.render.com/db?connectTimeout=10"
        );
        assertTrue(result.isPresent());
        assertEquals(
                "jdbc:postgresql://dpg-abc-a.oregon-postgres.render.com:5432/db?connectTimeout=10&sslmode=require",
                result.get().jdbcUrl()
        );
    }

    @Test
    void parseJdbcUrlReturnsEmpty() {
        assertTrue(DatabaseUrlResolver.parsePostgresUrl("jdbc:postgresql://localhost:5432/edepot").isEmpty());
        assertTrue(DatabaseUrlResolver.parsePostgresUrl(null).isEmpty());
    }

    @Test
    void configureFromEnvironmentAppliesDatabaseUrlAndFallback() {
        boolean configured = DatabaseUrlResolver.configureFromEnvironment(Map.of(
                "DATABASE_URL", "postgresql://u1:p1@dpg-internal-a/edepot_db_v2"
        ));
        assertTrue(configured);
        assertEquals("jdbc:postgresql://dpg-internal-a:5432/edepot_db_v2", System.getProperty("spring.datasource.url"));
        assertEquals("u1", System.getProperty("spring.datasource.username"));
        assertEquals("p1", System.getProperty("spring.datasource.password"));
        assertEquals("org.postgresql.Driver", System.getProperty("spring.datasource.driver-class-name"));

        cleanupSystemProperties();

        boolean fallbackConfigured = DatabaseUrlResolver.configureFromEnvironment(Map.of(
                "SPRING_DATASOURCE_URL", "postgresql://u2:p2@dpg-ext-a.oregon-postgres.render.com/edepot_db_v2"
        ));
        assertTrue(fallbackConfigured);
        assertEquals(
                "jdbc:postgresql://dpg-ext-a.oregon-postgres.render.com:5432/edepot_db_v2?sslmode=require",
                System.getProperty("spring.datasource.url")
        );

        cleanupSystemProperties();

        assertFalse(DatabaseUrlResolver.configureFromEnvironment(Map.of(
                "SPRING_DATASOURCE_URL", "jdbc:mysql://127.0.0.1:3306/edepot_db"
        )));
    }

    @Test
    void invalidPostgresUrlsThrowClearException() {
        assertThrows(IllegalArgumentException.class,
                () -> DatabaseUrlResolver.parsePostgresUrl("postgresql://user:pass@dpg-host-a/"));
        assertThrows(IllegalArgumentException.class,
                () -> DatabaseUrlResolver.parsePostgresUrl("postgresql:///edepot_db"));
    }
}
