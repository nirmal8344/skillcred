package com.adz4needz.skillcred.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${skillcred.env:${SKILLCRED_ENV:development}}")
    private String environment;

    @PostConstruct
    public void validateDatabaseConfig() {
        boolean isProduction = "production".equalsIgnoreCase(environment);
        if (isProduction) {
            if (dbUrl == null || dbUrl.isBlank()) {
                throw new IllegalStateException(
                    "FATAL: DATABASE_URL environment variable is required in production. " +
                    "Application will not start without a configured database."
                );
            }
            if (dbUrl.contains("localhost") || dbUrl.contains("127.0.0.1")) {
                throw new IllegalStateException(
                    "FATAL: DATABASE_URL points to localhost in production mode (" + dbUrl + "). " +
                    "Set DATABASE_URL to your managed cloud database (e.g. Render PostgreSQL)."
                );
            }
        }
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String resolvedUrl = dbUrl;
        String resolvedUser = dbUsername;
        String resolvedPass = dbPassword;

        // Auto-adapt Render / Heroku postgres:// or postgresql:// URLs to standard JDBC
        if (resolvedUrl != null && !resolvedUrl.startsWith("jdbc:")) {
            if (resolvedUrl.startsWith("postgres://") || resolvedUrl.startsWith("postgresql://")) {
                try {
                    String httpAdapted = resolvedUrl.replaceFirst("^postgres(ql)?://", "http://");
                    URI uri = new URI(httpAdapted);
                    String host = uri.getHost();
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                    String path = uri.getPath(); // /dbname

                    if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                        String[] userParts = uri.getUserInfo().split(":", 2);
                        resolvedUser = userParts[0];
                        if (userParts.length > 1) {
                            resolvedPass = userParts[1];
                        }
                    }

                    resolvedUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    log.info("Adapted cloud PostgreSQL URL to JDBC format for host: {}", host);
                } catch (Exception e) {
                    log.warn("Could not parse cloud PostgreSQL URL, using as raw JDBC URL: {}", e.getMessage());
                }
            }
        }

        config.setJdbcUrl(resolvedUrl);
        config.setUsername(resolvedUser);
        config.setPassword(resolvedPass);
        config.setDriverClassName("org.postgresql.Driver");

        // Optimal pool settings for cloud containers
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setPoolName("SkillCredHikariPool");

        return new HikariDataSource(config);
    }
}
