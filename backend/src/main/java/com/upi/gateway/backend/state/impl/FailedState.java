package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

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
        return List.of();
    }

    @Override
    public String getDescription() {
        return "Transaction failed during processing";
    }

    @Override
    public boolean isTerminal() {
        return true;
    }

    @Override
    public boolean allowsVerification() {
        return true;
    }
}
