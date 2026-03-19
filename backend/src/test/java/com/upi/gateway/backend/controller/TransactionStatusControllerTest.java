package com.upi.gateway.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upi.gateway.backend.dto.TransactionStatusUpdateRequest;
import com.upi.gateway.backend.model.Transaction;
import com.upi.gateway.backend.service.TransactionStatusService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionStatusController.class)
class TransactionStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionStatusService transactionStatusService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetTransaction() throws Exception {
        // Arrange
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = createTestTransaction(transactionId);
        
        TransactionStatusService.TransactionWithStateInfo stateInfo = 
            TransactionStatusService.TransactionWithStateInfo.builder()
                .transaction(transaction)
                .currentState("CREATED")
                .description("Transaction created")
                .isTerminal(false)
                .allowsVerification(false)
                .validNextStates(List.of("INITIATED"))
                .build();

        when(transactionStatusService.getTransactionWithState(transactionId))
            .thenReturn(Optional.of(stateInfo));

        // Act & Assert
        mockMvc.perform(get("/api/transaction/{id}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("₹.transaction.id").value(transactionId.toString()))
                .andExpect(jsonPath("₹.currentState").value("CREATED"))
                .andExpect(jsonPath("₹.description").value("Transaction created"))
                .andExpect(jsonPath("₹.isTerminal").value(false))
                .andExpect(jsonPath("₹.validNextStates[0]").value("INITIATED"));
    }

    @Test
    void testGetTransactionNotFound() throws Exception {
        // Arrange
        UUID transactionId = UUID.randomUUID();
        when(transactionStatusService.getTransactionWithState(transactionId))
            .thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/transaction/{id}", transactionId))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateTransactionStatus() throws Exception {
        // Arrange
        UUID transactionId = UUID.randomUUID();
        Transaction transaction = createTestTransaction(transactionId);
        transaction.setStatus(Transaction.TransactionStatus.INITIATED);

        TransactionStatusUpdateRequest request = new TransactionStatusUpdateRequest();
        request.setStatus("INITIATED");

        TransactionStatusService.TransactionWithStateInfo stateInfo = 
            TransactionStatusService.TransactionWithStateInfo.builder()
                .transaction(transaction)
                .currentState("INITIATED")
                .description("Transaction initiated")
                .isTerminal(false)
                .allowsVerification(true)
                .validNextStates(List.of("PROCESSING"))
                .build();

        when(transactionStatusService.isValidTransition(transactionId, "INITIATED")).thenReturn(true);
        when(transactionStatusService.updateStatus(transactionId, "INITIATED")).thenReturn(transaction);
        when(transactionStatusService.getTransactionWithState(transactionId)).thenReturn(Optional.of(stateInfo));

        // Act & Assert
        mockMvc.perform(patch("/api/transaction/{id}/status", transactionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("₹.transaction.status").value("INITIATED"))
                .andExpect(jsonPath("₹.currentState").value("INITIATED"));
    }

    @Test
    void testUpdateTransactionStatusInvalidTransition() throws Exception {
        // Arrange
        UUID transactionId = UUID.randomUUID();
        TransactionStatusUpdateRequest request = new TransactionStatusUpdateRequest();
        request.setStatus("PROCESSING");

        when(transactionStatusService.isValidTransition(transactionId, "PROCESSING")).thenReturn(false);

        // Act & Assert
        mockMvc.perform(patch("/api/transaction/{id}/status", transactionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("₹.error").value("Invalid state transition to PROCESSING"));
    }

    @Test
    void testGetValidNextStates() throws Exception {
        // Arrange
        UUID transactionId = UUID.randomUUID();
        List<String> nextStates = List.of("PROCESSING", "FAILED");

        when(transactionStatusService.getValidNextStates(transactionId)).thenReturn(nextStates);

        // Act & Assert
        mockMvc.perform(get("/api/transaction/{id}/next-states", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("₹[0]").value("PROCESSING"))
                .andExpect(jsonPath("₹[1]").value("FAILED"));
    }

    private Transaction createTestTransaction(UUID id) {
        return Transaction.builder()
                .id(id)
                .merchantId(1L)
                .amount(new BigDecimal("100.00"))
                .status(Transaction.TransactionStatus.CREATED)
                .paymentMethod("UPI")
                .build();
    }
}