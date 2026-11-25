package sn.uasz.edepot.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

/**
 * Convertit automatiquement les URLs PostgreSQL fournies par les hébergeurs cloud
 * (notamment Render {@code DATABASE_URL} au format {@code postgres://} ou {@code postgresql://})
 * en propriétés JDBC Spring Boot avant le démarrage du contexte Spring.
 */
public final class DatabaseUrlResolver {

    private DatabaseUrlResolver() {
    }

    public record ResolvedDatasource(
            String jdbcUrl,
            String username,
            String password,
            String driverClassName
    ) {
    }

    /**
     * Inspecte les variables d'environnement système et injecte les propriétés JDBC
     * correspondantes via {@link System#setProperty(String, String)} si une URL PostgreSQL cloud est détectée.
     */
    public static void configureFromEnvironment() {
        configureFromEnvironment(System.getenv());
    }

    static boolean configureFromEnvironment(Map<String, String> env) {
        String sourceName = "DATABASE_URL";
        String rawUrl = env.get("DATABASE_URL");

        if (rawUrl == null || rawUrl.isBlank()) {
            String springUrl = env.get("SPRING_DATASOURCE_URL");
            if (springUrl != null && isPostgresUri(springUrl.trim())) {
                sourceName = "SPRING_DATASOURCE_URL";
                rawUrl = springUrl;
            }
        }

        if (rawUrl == null || rawUrl.isBlank()) {
            return false;
        }

        Optional<ResolvedDatasource> resolvedOpt = parsePostgresUrl(rawUrl);
        if (resolvedOpt.isEmpty()) {
            return false;
        }

        ResolvedDatasource resolved = resolvedOpt.get();
        System.setProperty("spring.datasource.url", resolved.jdbcUrl());
        System.setProperty("spring.datasource.driver-class-name", resolved.driverClassName());
        System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
        if (resolved.username() != null && !resolved.username().isBlank()) {
            System.setProperty("spring.datasource.username", resolved.username());
        }
        if (resolved.password() != null) {
            System.setProperty("spring.datasource.password", resolved.password());
        }

        System.out.println("[E-Dépôt] Datasource PostgreSQL configurée depuis " + sourceName
                + " -> " + resolved.jdbcUrl()
                + " (utilisateur=" + (resolved.username() != null ? resolved.username() : "non-spécifié") + ")");
        return true;
    }

    public static Optional<ResolvedDatasource> parsePostgresUrl(String rawUrl) {
        if (rawUrl == null) {
            return Optional.empty();
        }
        String trimmed = rawUrl.trim();
        if (!isPostgresUri(trimmed)) {
            return Optional.empty();
        }

        URI uri = URI.create(trimmed);
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Hôte PostgreSQL manquant dans l'URL de base de données.");
        }

        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();
        if (path == null || path.isBlank() || "/".equals(path)) {
            throw new IllegalArgumentException("Nom de base de données manquant dans l'URL PostgreSQL.");
        }

        String username = null;
        String password = null;
        String rawUserInfo = uri.getRawUserInfo();
        if (rawUserInfo != null && !rawUserInfo.isBlank()) {
            int colonIdx = rawUserInfo.indexOf(':');
            if (colonIdx >= 0) {
                username = decode(rawUserInfo.substring(0, colonIdx));
                password = decode(rawUserInfo.substring(colonIdx + 1));
            } else {
                username = decode(rawUserInfo);
            }
        }

        String query = uri.getRawQuery();
        boolean isExternalRender = host.endsWith(".render.com");
        if (isExternalRender && (query == null || !query.contains("sslmode="))) {
            query = (query == null || query.isBlank())
                    ? "sslmode=require"
                    : query + "&sslmode=require";
        }

        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
                .append(host)
                .append(':')
                .append(port)
                .append(path);
        if (query != null && !query.isBlank()) {
            jdbc.append('?').append(query);
        }

        return Optional.of(new ResolvedDatasource(
                jdbc.toString(),
                username,
                password,
                "org.postgresql.Driver"
        ));
    }

    private static boolean isPostgresUri(String url) {
        return url.startsWith("postgres://") || url.startsWith("postgresql://");
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
