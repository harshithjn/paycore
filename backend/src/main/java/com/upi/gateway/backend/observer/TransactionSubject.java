package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

/**
 * Subject interface for Observer Pattern
 * Defines contract for managing observers and notifications
 */
public interface TransactionSubject {
    
    /**
     * Register an observer
     * @param observer The observer to register
     */
    void registerObserver(TransactionObserver observer);
    
    /**
     * Remove an observer
     * @param observer The observer to remove
     */
    void removeObserver(TransactionObserver observer);
    
    /**
     * Notify all registered observers
     * @param transaction The transaction that changed
     */
    void notifyObservers(Transaction transaction);
}