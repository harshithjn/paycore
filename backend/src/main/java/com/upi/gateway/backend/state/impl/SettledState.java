package com.upi.gateway.backend.state.impl;

import com.upi.gateway.backend.state.TransactionStateHandler;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SettledState implements TransactionStateHandler {

    @Override
    public String getState() {
        return "SETTLED";
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
        return "Transaction has been settled and finalized";
    }

    @Override
    public boolean isTerminal() {
        return true;
    }

    @Override
    public boolean allowsVerification() {
        return false;
    }
}
