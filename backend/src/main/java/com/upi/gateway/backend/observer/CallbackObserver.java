package com.upi.gateway.backend.observer;

import com.upi.gateway.backend.model.Transaction;

public interface CallbackObserver {

    void update(Transaction transaction);
}
