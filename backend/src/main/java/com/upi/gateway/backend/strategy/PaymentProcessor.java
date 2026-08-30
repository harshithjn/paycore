package com.upi.gateway.backend.strategy;

import com.upi.gateway.backend.model.Transaction;
import java.util.concurrent.CompletableFuture;

public interface PaymentProcessor {

    CompletableFuture<PaymentResult> process(Transaction transaction);

    String getPaymentMethod();

    boolean canProcess(Transaction transaction);
}
