package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.CallbackLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CallbackLogRepository extends JpaRepository<CallbackLog, UUID> {

    List<CallbackLog> findByTransactionIdOrderByTimestampDesc(UUID transactionId);

    List<CallbackLog> findByStatusSentOrderByTimestampDesc(String statusSent);

    @Query("SELECT c FROM CallbackLog c WHERE c.responseCode < 200 OR c.responseCode >= 300 ORDER BY c.timestamp DESC")
    List<CallbackLog> findFailedCallbacks();

    @Query("SELECT COUNT(c) FROM CallbackLog c WHERE c.transactionId = :transactionId AND c.callbackUrl != 'INTERNAL_LOG'")
    Long countCallbackAttempts(@Param("transactionId") UUID transactionId);

    @Query("SELECT c FROM CallbackLog c WHERE (c.responseCode < 200 OR c.responseCode >= 300) AND c.retryCount < 3 ORDER BY c.timestamp DESC")
    List<CallbackLog> findCallbacksForRetry();
}
