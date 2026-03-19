package com.upi.gateway.backend.state;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Factory for managing transaction state handlers
 * Following Open-Closed Principle - new states can be added without modifying this factory
 */
@Component
@Slf4j
public class TransactionStateFactory {
    
    private final Map<String, TransactionStateHandler> stateMap;
    
    @Autowired
    public TransactionStateFactory(List<TransactionStateHandler> handlers) {
        this.stateMap = handlers.stream()
                .collect(Collectors.toMap(
                    TransactionStateHandler::getState, 
                    handler -> handler
                ));
        
        log.info("Initialized TransactionStateFactory with {} state handlers: {}", 
                stateMap.size(), stateMap.keySet());
    }
    
    /**
     * Get state handler for given state
     * @param state State name
     * @return TransactionStateHandler for the state
     * @throws IllegalArgumentException if state is not supported
     */
    public TransactionStateHandler getHandler(String state) {
        TransactionStateHandler handler = stateMap.get(state);
        if (handler == null) {
            throw new IllegalArgumentException("Unsupported transaction state: " + state);
        }
        return handler;
    }
    
    /**
     * Check if state is supported
     * @param state State name to check
     * @return true if state is supported, false otherwise
     */
    public boolean isStateSupported(String state) {
        return stateMap.containsKey(state);
    }
    
    /**
     * Get all supported states
     * @return List of all supported state names
     */
    public List<String> getSupportedStates() {
        return List.copyOf(stateMap.keySet());
    }
    
    /**
     * Validate state transition
     * @param fromState Current state
     * @param toState Target state
     * @return true if transition is valid, false otherwise
     */
    public boolean isValidTransition(String fromState, String toState) {
        if (!isStateSupported(fromState) || !isStateSupported(toState)) {
            return false;
        }
        
        TransactionStateHandler handler = getHandler(fromState);
        return handler.canTransitionTo(toState);
    }
    
    /**
     * Get valid next states for current state
     * @param currentState Current state name
     * @return List of valid next states
     */
    public List<String> getValidNextStates(String currentState) {
        if (!isStateSupported(currentState)) {
            return List.of();
        }
        
        return getHandler(currentState).getValidNextStates();
    }
    
    /**
     * Check if verification is allowed for current state
     * @param currentState Current state name
     * @return true if verification is allowed, false otherwise
     */
    public boolean allowsVerification(String currentState) {
        if (!isStateSupported(currentState)) {
            return false;
        }
        
        return getHandler(currentState).allowsVerification();
    }
}