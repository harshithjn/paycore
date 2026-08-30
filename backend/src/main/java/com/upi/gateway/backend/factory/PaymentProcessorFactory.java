package com.upi.gateway.backend.factory;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.strategy.PaymentProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class PaymentProcessorFactory {

    private final List<PaymentProcessor> processors;

    @Autowired
    public PaymentProcessorFactory(List<PaymentProcessor> processors) {
        this.processors = processors;
        log.info("Initialized PaymentProcessorFactory with {} processors", processors.size());
        processors.forEach(processor ->
            log.info("Registered processor: {} for method: {}",
                    processor.getClass().getSimpleName(), processor.getPaymentMethod()));
    }

    public Optional<PaymentProcessor> getProcessor(Transaction transaction) {
        return processors.stream()
                .filter(processor -> processor.canProcess(transaction))
                .findFirst();
    }

    public Optional<PaymentProcessor> getProcessorByMethod(String paymentMethod) {
        return processors.stream()
                .filter(processor -> processor.getPaymentMethod().equalsIgnoreCase(paymentMethod))
                .findFirst();
    }

    public List<String> getAvailablePaymentMethods() {
        return processors.stream()
                .map(PaymentProcessor::getPaymentMethod)
                .toList();
    }
}
