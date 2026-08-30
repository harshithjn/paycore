package com.upi.gateway.backend.service;

import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.repository.TransactionRepository;
import com.upi.gateway.backend.state.TransactionStateFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionStatusServiceTest {

    @Mock
    private TransactionRepository repository;

    @Mock
    private TransactionStateFactory stateFactory;

    @Mock
    private EnhancedTransactionService transactionService;

    private TransactionStatusService transactionStatusService;

    @BeforeEach
    void setUp() {
        transactionStatusService = new TransactionStatusService(repository, stateFactory, transactionService);
    }

    @Test
    void testValidStateTransition() {
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = createTestTransaction(transactionId, Transaction.TransactionStatus.CREATED);

        when(repository.findById(transactionId)).thenReturn(Optional.of(transaction));
        when(stateFactory.getHandler("CREATED")).thenReturn(new MockStateHandler("CREATED", true));
        when(repository.save(any(Transaction.class))).thenReturn(transaction);

        Transaction result = transactionStatusService.updateStatus(transactionId, "INITIATED");

        assertEquals(Transaction.TransactionStatus.INITIATED, result.getStatus());
        verify(transactionService).notifyObservers(result);
        verify(repository).save(transaction);
    }

    @Test
    void testInvalidStateTransition() {
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = createTestTransaction(transactionId, Transaction.TransactionStatus.SUCCESS);

        when(repository.findById(transactionId)).thenReturn(Optional.of(transaction));
        when(stateFactory.getHandler("SUCCESS")).thenReturn(new MockStateHandler("SUCCESS", false));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            transactionStatusService.updateStatus(transactionId, "PROCESSING");
        });

        assertTrue(exception.getMessage().contains("Invalid transition"));
        verify(transactionService, never()).notifyObservers(any());
        verify(repository, never()).save(any());
    }

    @Test
    void testTransactionNotFound() {
        UUID transactionId = UUID.randomUUID();
        when(repository.findById(transactionId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            transactionStatusService.updateStatus(transactionId, "INITIATED");
        });

        assertTrue(exception.getMessage().contains("Transaction not found"));
    }

    @Test
    void testUpdateStatusWithFailureReason() {
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = createTestTransaction(transactionId, Transaction.TransactionStatus.PROCESSING);

        when(repository.findById(transactionId)).thenReturn(Optional.of(transaction));
        when(stateFactory.getHandler("PROCESSING")).thenReturn(new MockStateHandler("PROCESSING", true));
        when(repository.save(any(Transaction.class))).thenReturn(transaction);

        Transaction result = transactionStatusService.updateStatus(transactionId, "FAILED", "Payment timeout");

        assertEquals(Transaction.TransactionStatus.FAILED, result.getStatus());
        assertEquals("Payment timeout", result.getFailureReason());
        verify(transactionService).notifyObservers(result);
    }

    private Transaction createTestTransaction(UUID id, Transaction.TransactionStatus status) {
        return Transaction.builder()
                .id(id)
                .merchantId(1L)
                .amount(new BigDecimal("100.00"))
                .status(status)
                .paymentMethod("UPI")
                .build();
    }

    private static class MockStateHandler implements com.upi.gateway.backend.state.TransactionStateHandler {
        private final String state;
        private final boolean canTransition;

        public MockStateHandler(String state, boolean canTransition) {
            this.state = state;
            this.canTransition = canTransition;
        }

        @Override
        public String getState() {
            return state;
        }

        @Override
        public boolean canTransitionTo(String nextState) {
            return canTransition;
        }

        @Override
        public java.util.List<String> getValidNextStates() {
            return canTransition ? java.util.List.of("INITIATED", "PROCESSING", "SUCCESS", "FAILED") : java.util.List.of();
        }

        @Override
        public String getDescription() {
            return "Mock state for testing";
        }

        @Override
        public boolean isTerminal() {
            return false;
        }

        @Override
        public boolean allowsVerification() {
            return true;
        }
    }
}
