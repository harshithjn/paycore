package com.upi.gateway.backend.state;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public TransactionStateHandler getHandler(String state) {
        TransactionStateHandler handler = stateMap.get(state);
        if (handler == null) {
            throw new IllegalArgumentException("Unsupported transaction state: " + state);
        }
        return handler;
    }

    public boolean isStateSupported(String state) {
        return stateMap.containsKey(state);
    }

    public List<String> getSupportedStates() {
        return List.copyOf(stateMap.keySet());
    }

    public boolean isValidTransition(String fromState, String toState) {
        if (!isStateSupported(fromState) || !isStateSupported(toState)) {
            return false;
        }

        TransactionStateHandler handler = getHandler(fromState);
        return handler.canTransitionTo(toState);
    }

    public List<String> getValidNextStates(String currentState) {
        if (!isStateSupported(currentState)) {
            return List.of();
        }

        return getHandler(currentState).getValidNextStates();
    }

    public boolean allowsVerification(String currentState) {
        if (!isStateSupported(currentState)) {
            return false;
        }

        return getHandler(currentState).allowsVerification();
    }
}
