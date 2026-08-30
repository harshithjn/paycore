package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

public interface TransactionSubject {

    void registerObserver(TransactionObserver observer);

    void removeObserver(TransactionObserver observer);

    void notifyObservers(Transaction transaction);
}
