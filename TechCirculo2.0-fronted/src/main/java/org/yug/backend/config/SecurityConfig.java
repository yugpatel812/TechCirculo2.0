package org.yug.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtFilter jwtFilter, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtFilter = jwtFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // ✅ Allow all static files (HTML, CSS, JS, images) without authentication
                .requestMatchers(
                    "/", "/index.html", "/SignIn.html", "/dashboard.html", "/community.html", "/profile.html",
                    "/css/**", "/js/**", "/images/**"
                ).permitAll()

                // ✅ Allow auth endpoints
                .requestMatchers("/auth/**").permitAll()

                // 🔒 Require JWT for all API calls
                .requestMatchers("/api/**").authenticated()

                // Default rule for anything else
                .anyRequest().permitAll()
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .sessionManagement(session -> session.sessionCreationPolicy(
                org.springframework.security.config.http.SessionCreationPolicy.STATELESS
            ));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
