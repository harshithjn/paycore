package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProcessingState implements TransactionStateHandler {

    @Override
    public String getState() {
        return "PROCESSING";
    }

    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }

    @Override
    public List<String> getValidNextStates() {
        return List.of("SUCCESS", "FAILED");
    }

    @Override
    public String getDescription() {
        return "Transaction is being processed by the payment gateway";
    }

    @Override
    public boolean isTerminal() {
        return false;
    }

    @Override
    public boolean allowsVerification() {
        return true;
    }
}
