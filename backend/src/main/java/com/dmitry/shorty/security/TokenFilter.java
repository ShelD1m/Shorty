package com.dmitry.shorty.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

public class TokenFilter extends OncePerRequestFilter {

    private final TokenService tokens;

    public TokenFilter(TokenService tokens) {
        this.tokens = tokens;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String raw = auth.substring(7).trim();
            Optional<String> sub = tokens.parseSubject(raw);
            if (sub.isPresent()) {
                String principal = sub.get(); // userId as string
                AbstractAuthenticationToken authentication =
                        new AbstractAuthenticationToken(AuthorityUtils.NO_AUTHORITIES) {
                            @Override public Object getCredentials() { return raw; }
                            @Override public Object getPrincipal() { return principal; }
                        };
                authentication.setAuthenticated(true);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}
