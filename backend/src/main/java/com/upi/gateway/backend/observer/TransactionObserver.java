package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

/**
 * Observer interface for transaction status changes
 * Following Dependency Inversion Principle - high-level modules depend on this abstraction
 */
public interface TransactionObserver {
    
    /**
     * Called when transaction status changes
     * @param transaction The transaction with updated status
     */
    void update(Transaction transaction);
    
    /**
     * Get observer type for identification
     * @return Observer type identifier
     */
    String getType();
}