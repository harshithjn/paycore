package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Refunded state - Transaction has been refunded
 */
@Component
public class RefundedState implements TransactionStateHandler {
    
    @Override
    public String getState() {
        return "REFUNDED";
    }
    
    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }
    
    @Override
    public List<String> getValidNextStates() {
        return List.of("SETTLED");
    }
    
    @Override
    public String getDescription() {
        return "Transaction has been refunded to the customer";
    }
    
    @Override
    public boolean isTerminal() {
        return false; // Can still be settled
    }
    
    @Override
    public boolean allowsVerification() {
        return true; // Can verify refunded transactions for reconciliation
    }
}