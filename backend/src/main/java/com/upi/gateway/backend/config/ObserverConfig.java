package com.upi.gateway.backend.config;

import com.upi.gateway.backend.observer.CallbackLogObserver;
import com.upi.gateway.backend.observer.EnhancedMerchantWebhookObserver;
import com.upi.gateway.backend.observer.LoggingObserver;
import com.upi.gateway.backend.observer.MerchantWebhookObserver;
import com.upi.gateway.backend.service.PaymentService;
import com.upi.gateway.backend.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;

/**
 * Configuration class for setting up Observer Pattern
 * Registers all observers with the PaymentService and PaymentVerificationService (Subjects)
 * Demonstrates both RestTemplate and WebClient based observers
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class ObserverConfig {
    
    private final PaymentService paymentService;
    private final PaymentVerificationService verificationService;
    private final MerchantWebhookObserver webhookObserver;
    private final EnhancedMerchantWebhookObserver enhancedWebhookObserver;
    private final LoggingObserver loggingObserver;
    private final CallbackLogObserver callbackLogObserver;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
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
        log.info("Registering observers with PaymentService and PaymentVerificationService...");
        
        // Register observers with PaymentService
        paymentService.registerObserver(webhookObserver);
        paymentService.registerObserver(enhancedWebhookObserver);
        paymentService.registerObserver(loggingObserver);
        paymentService.registerObserver(callbackLogObserver);
        
        // Register observers with PaymentVerificationService
        verificationService.registerObserver(webhookObserver);
        verificationService.registerObserver(enhancedWebhookObserver);
        verificationService.registerObserver(loggingObserver);
        verificationService.registerObserver(callbackLogObserver);
        
        log.info("Successfully registered {} observers with both services", 4);
        log.info("Registered observers: MerchantWebhookObserver (RestTemplate), " +
                "EnhancedMerchantWebhookObserver (WebClient), LoggingObserver, CallbackLogObserver");
    }
}