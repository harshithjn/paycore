package com.upi.gateway.backend.verification;

import com.upi.gateway.backend.model.Transaction;

public interface VerificationStrategy {

    VerificationResult verify(Transaction transaction);

    String getType();

    boolean canHandle(Transaction transaction);

    long getTimeoutMs();
}
