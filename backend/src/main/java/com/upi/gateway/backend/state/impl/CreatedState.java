package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CreatedState implements TransactionStateHandler {

    @Override
    public String getState() {
        return "CREATED";
    }

    @Override
    public boolean canTransitionTo(String nextState) {
        return getValidNextStates().contains(nextState);
    }

    @Override
    public List<String> getValidNextStates() {
        return List.of("INITIATED");
    }

    @Override
    public String getDescription() {
        return "Transaction has been created and is awaiting initiation";
    }

    @Override
    public boolean isTerminal() {
        return false;
    }

    @Override
    public boolean allowsVerification() {
        return false;
    }
}
