package com.upi.gateway.backend.state;

import java.util.List;

public interface TransactionStateHandler {

    String getState();

    boolean canTransitionTo(String nextState);

    List<String> getValidNextStates();

    String getDescription();

    boolean isTerminal();

    boolean allowsVerification();
}
