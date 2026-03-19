package com.upi.gateway.backend.config;

import com.upi.gateway.backend.observer.TransactionObserver;
import com.upi.gateway.backend.service.PaymentService;
import com.upi.gateway.backend.service.PaymentVerificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.List;

/**
 * Configuration class for setting up Observer Pattern
 * Registers all observers with the PaymentService and PaymentVerificationService (Subjects)
 * Demonstrates both RestTemplate and WebClient based observers
 */
@Configuration
@Slf4j
public class ObserverConfig {
    
    private final PaymentService paymentService;
    private final PaymentVerificationService verificationService;
    private final List<TransactionObserver> observers;
    
    public ObserverConfig(
            PaymentService paymentService,
            PaymentVerificationService verificationService,
            List<TransactionObserver> observers) {
        this.paymentService = paymentService;
        this.verificationService = verificationService;
        this.observers = observers;
    }
    
    /**
     * Register observers with both PaymentService and PaymentVerificationService after bean initialization
     * Following Dependency Inversion Principle - Services depend on Observer abstraction
     * 
     * Note: We register both traditional and enhanced observers to demonstrate different approaches:
     * - MerchantWebhookObserver: Uses RestTemplate (traditional approach)
     * - EnhancedMerchantWebhookObserver: Uses WebClient (modern reactive approach)
     * - LoggingObserver: General purpose logging
     * - CallbackLogObserver: Dedicated callback logging
     */
    @PostConstruct
    public void registerObservers() {
        log.info("Registering {} observers with PaymentService and PaymentVerificationService...", observers.size());
        
        // Register all observers with both services
        for (TransactionObserver observer : observers) {
            paymentService.registerObserver(observer);
            verificationService.registerObserver(observer);
            log.info("Registered observer: {}", observer.getType());
        }
        
        log.info("Successfully registered all observers with both services");
    }
}