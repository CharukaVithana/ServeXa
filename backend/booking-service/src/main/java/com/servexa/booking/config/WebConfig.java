package com.servexa.booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/**")
           .allowedOrigins("http://localhost:5173", "http://localhost:3000")
           .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
           .allowedHeaders("*")
           .exposedHeaders("Authorization") // 👈 allow browser to access JWT tokens if sent back
           .allowCredentials(true);         // 👈 allow cookies or auth headers
    }
}
