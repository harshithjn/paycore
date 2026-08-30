package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

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
        return false;
    }

    @Override
    public boolean allowsVerification() {
        return true;
    }
}
