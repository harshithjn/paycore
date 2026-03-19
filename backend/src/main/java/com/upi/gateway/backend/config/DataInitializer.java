package com.upi.gateway.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {
    
    @Override
    public void run(String... args) {
        log.info("Application started. No sample data seeded.");
    }
}