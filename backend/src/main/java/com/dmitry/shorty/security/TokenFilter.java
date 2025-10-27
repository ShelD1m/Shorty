package com.dmitry.shorty.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class TokenFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    public TokenFilter(TokenService tokens){ this.tokens = tokens; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                var tu = tokens.parse(auth.substring(7));
                var at = new UsernamePasswordAuthenticationToken(
                        tu.id(), null, List.of(new SimpleGrantedAuthority("ROLE_" + tu.role()))
                );
                SecurityContextHolder.getContext().setAuthentication(at);
            } catch (Exception ignored) {}
        }
        chain.doFilter(request, response);
    }
}