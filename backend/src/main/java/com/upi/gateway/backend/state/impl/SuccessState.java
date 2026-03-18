package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Success state - Transaction completed successfully
 */
@Component
public class SuccessState implements TransactionStateHandler {
    
    @Override
    public String getState() {
        return "SUCCESS";
    }
    
    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }
    
    @Override
    public List<String> getValidNextStates() {
        return List.of("REFUNDED", "SETTLED");
    }
    
    @Override
    public String getDescription() {
        return "Transaction completed successfully";
    }
    
    @Override
    public boolean isTerminal() {
        return false; // Can still be refunded or settled
    }
    
    @Override
    public boolean allowsVerification() {
        return true; // Can verify successful transactions for reconciliation
    }
}