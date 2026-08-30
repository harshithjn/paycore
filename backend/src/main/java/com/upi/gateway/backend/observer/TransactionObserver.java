package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

public interface TransactionObserver {

    void update(Transaction transaction);

    String getType();
}
