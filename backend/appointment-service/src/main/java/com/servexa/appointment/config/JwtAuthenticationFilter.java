package com.servexa.appointment.config;

import com.servexa.common.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        log.debug("Processing request to {} with auth header: {}", request.getRequestURI(), authHeader != null ? "Present" : "Missing");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Bearer token found in request to {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String jwt = authHeader.substring(7);
            log.debug("Extracted JWT token: {}", jwt.substring(0, Math.min(20, jwt.length())) + "...");
            
            // Validate token
            if (!jwtUtil.validateToken(jwt)) {
                log.warn("JWT token is invalid or expired for request to {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            
            String username = jwtUtil.extractUsername(jwt);
            String userId = jwtUtil.extractUserId(jwt);
            String role = jwtUtil.extractRole(jwt).toString();
            
            log.debug("Extracted user info - Username: {}, UserId: {}, Role: {}", username, userId, role);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, authorities
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                // Store user info in request for later use
                request.setAttribute("userId", userId);
                request.setAttribute("userEmail", username);
                request.setAttribute("userRole", role);
                
                log.debug("Successfully authenticated user {} with role {} for request to {}", username, role, request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication for request to {}: {}", request.getRequestURI(), e.getMessage(), e);
        }
        
        filterChain.doFilter(request, response);
    }
}