package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Initiated state - Transaction has been initiated and ready for processing
 */
@Component
public class InitiatedState implements TransactionStateHandler {
    
    @Override
    public String getState() {
        return "INITIATED";
    }
    
    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }
    
    @Override
    public List<String> getValidNextStates() {
        return List.of("PROCESSING");
    }
    
    @Override
    public String getDescription() {
        return "Transaction has been initiated and is ready for processing";
    }
    
    @Override
    public boolean isTerminal() {
        return false;
    }
    
    @Override
    public boolean allowsVerification() {
        return true; // Can verify initiated transactions
    }
}