package com.upi.gateway.backend.verification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Factory for managing verification strategies
 * Following Open-Closed Principle - new verification strategies can be added without modifying this factory
 */
@Component
@Slf4j
public class VerificationFactory {
    
    private final Map<String, VerificationStrategy> strategyMap;
    
    @Autowired
    public VerificationFactory(List<VerificationStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(
                    VerificationStrategy::getType,
                    strategy -> strategy
                ));
        
        log.info("Initialized VerificationFactory with {} verification strategies: {}", 
                strategyMap.size(), strategyMap.keySet());
    }
    
    /**
     * Get verification strategy for given payment method
     * @param paymentMethod Payment method type
     * @return VerificationStrategy for the payment method
     * @throws IllegalArgumentException if payment method is not supported
     */
    public VerificationStrategy getStrategy(String paymentMethod) {
        VerificationStrategy strategy = strategyMap.get(paymentMethod.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment method for verification: " + paymentMethod);
        }
        return strategy;
    }
    
    /**
     * Check if payment method is supported for verification
     * @param paymentMethod Payment method to check
     * @return true if supported, false otherwise
     */
    public boolean isPaymentMethodSupported(String paymentMethod) {
        return strategyMap.containsKey(paymentMethod.toUpperCase());
    }
    
    /**
     * Get all supported payment methods for verification
     * @return List of supported payment method names
     */
    public List<String> getSupportedPaymentMethods() {
        return List.copyOf(strategyMap.keySet());
    }
}