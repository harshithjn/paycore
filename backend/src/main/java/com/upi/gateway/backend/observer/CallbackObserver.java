package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

/**
 * Callback Observer interface following the exact specification
 * This is an alias for TransactionObserver to match the requirements exactly
 */
public interface CallbackObserver {
    
    /**
     * Called when transaction status changes
     * @param transaction The transaction with updated status
     */
    void update(Transaction transaction);
}