package com.upi.gateway.backend.state;

import java.util.List;

/**
 * State interface for transaction lifecycle management
 * Following State Pattern and Open-Closed Principle
 */
public interface TransactionStateHandler {
    
    /**
     * Get the state name this handler manages
     * @return State name
     */
    String getState();
    
    /**
     * Check if transition to next state is allowed
     * @param nextState Target state to transition to
     * @return true if transition is valid, false otherwise
     */
    boolean canTransitionTo(String nextState);
    
    /**
     * Get list of valid next states from current state
     * @return List of valid next state names
     */
    List<String> getValidNextStates();
    
    /**
     * Get state description for documentation
     * @return Human-readable state description
     */
    String getDescription();
    
    /**
     * Check if this is a terminal state (no further transitions allowed)
     * @return true if terminal state, false otherwise
     */
    boolean isTerminal();
    
    /**
     * Check if verification is allowed in this state
     * @return true if verification can be performed, false otherwise
     */
    boolean allowsVerification();
}