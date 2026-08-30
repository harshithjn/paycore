package com.upi.gateway.backend.verification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public VerificationStrategy getStrategy(String paymentMethod) {
        VerificationStrategy strategy = strategyMap.get(paymentMethod.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment method for verification: " + paymentMethod);
        }
        return strategy;
    }

    public boolean isPaymentMethodSupported(String paymentMethod) {
        return strategyMap.containsKey(paymentMethod.toUpperCase());
    }

    public List<String> getSupportedPaymentMethods() {
        return List.copyOf(strategyMap.keySet());
    }
}
