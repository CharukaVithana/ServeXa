package com.servexa.appointment.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = {"com.servexa.common", "com.servexa.appointment"})
public class AppConfig {
    // JwtUtil is already a @Component in common-libs, so it will be auto-discovered
    // No need to manually create a bean
}