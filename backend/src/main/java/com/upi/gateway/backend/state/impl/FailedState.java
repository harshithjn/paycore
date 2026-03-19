package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Failed state - Transaction failed during processing
 */
@Component
public class FailedState implements TransactionStateHandler {
    
    @Override
    public String getState() {
        return "FAILED";
    }
    
    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }
    
    @Override
    public List<String> getValidNextStates() {
        return List.of(); // Failed transactions cannot transition to other states
    }
    
    @Override
    public String getDescription() {
        return "Transaction failed during processing";
    }
    
    @Override
    public boolean isTerminal() {
        return true; // Failed is a terminal state
    }
    
    @Override
    public boolean allowsVerification() {
        return true; // Can verify failed transactions to understand failure reason
    }
}