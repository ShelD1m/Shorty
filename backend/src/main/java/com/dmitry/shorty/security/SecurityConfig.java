package com.dmitry.shorty.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, TokenFilter tf) throws Exception {
        http.csrf(csrf->csrf.disable());
        http.sessionManagement(sm->sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.authorizeHttpRequests(reg->reg
                .requestMatchers("/api/auth/**","/r/**","/v3/api-docs/**","/swagger-ui/**","/actuator/health").permitAll()
                .anyRequest().authenticated());
        http.addFilterBefore(tf, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
