package com.logifleet.api_gateway.config;

import javax.crypto.SecretKey;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import javax.crypto.spec.SecretKeySpec;

import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final String SECRET_KEY =
            "LogiFleetSuperSecretKeyForJWTAuthentication2026";

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {

        byte[] keyBytes = SECRET_KEY.getBytes(
                java.nio.charset.StandardCharsets.UTF_8);

        // HS256 — matches JJWT signing algorithm in auth-service
        SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");

        return NimbusReactiveJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(
                        org.springframework.security.oauth2.jose.jws
                                .MacAlgorithm.HS256)
                .build();
    }

    // Reads the "role" claim from the JWT and converts it to a Spring
    // Security GrantedAuthority so hasRole() checks work in path matchers.
    // Example: JWT claim "role": "ADMIN" → Spring authority: "ROLE_ADMIN"
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {

        // JwtGrantedAuthoritiesConverter is the standard servlet-side
        // converter — we wrap it below to make it work in reactive context
        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        // Our JWT claim is called "role", not the default "scope" / "scp"
        authoritiesConverter.setAuthoritiesClaimName("role");

        // Add "ROLE_" prefix so hasRole("ADMIN") matches claim value "ADMIN"
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        ReactiveJwtAuthenticationConverter converter =
                new ReactiveJwtAuthenticationConverter();

        // Wrap the sync converter in a reactive Flux so it works with
        // the reactive security chain
        converter.setJwtGrantedAuthoritiesConverter(
                jwt -> Flux.fromIterable(authoritiesConverter.convert(jwt))
        );

        return converter;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http
                .csrf(csrf -> csrf.disable())

                .authorizeExchange(exchange -> exchange

                        // Auth endpoints are public
                        .pathMatchers("/api/auth/login").permitAll()
                        .pathMatchers("/api/auth/register").permitAll()

                        // Vehicle management — ADMIN only for write
                        // Reading vehicles — ADMIN, DISPATCHER, MAINTENANCE
                        .pathMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/vehicles/**")
                                .hasRole("ADMIN")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/vehicles/**")
                                .hasRole("ADMIN")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/vehicles/**")
                                .hasRole("ADMIN")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/vehicles/**")
                                .hasAnyRole("ADMIN", "DISPATCHER",
                                        "MAINTENANCE")

                        // Trip management — ADMIN, DISPATCHER
                        .pathMatchers("/api/trips/**")
                                .hasAnyRole("ADMIN", "DISPATCHER")

                        // Maintenance write — ADMIN, MAINTENANCE
                        // Maintenance read — ADMIN, DISPATCHER, MAINTENANCE
                        .pathMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/maintenance/**")
                                .hasAnyRole("ADMIN", "MAINTENANCE")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/maintenance/**")
                                .hasAnyRole("ADMIN", "MAINTENANCE")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/maintenance/**")
                                .hasAnyRole("ADMIN", "MAINTENANCE")
                        .pathMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/maintenance/**")
                                .hasAnyRole("ADMIN", "DISPATCHER",
                                        "MAINTENANCE")

                        // User lookup — ADMIN only
                        .pathMatchers("/api/auth/user/**")
                                .hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyExchange().authenticated()
                )

                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtDecoder(jwtDecoder())
                                .jwtAuthenticationConverter(
                                        jwtAuthenticationConverter())
                        )
                )

                .build();
    }
}