package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.ApiRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiRequestLogRepository extends JpaRepository<ApiRequestLog, Long> {

    List<ApiRequestLog> findTop50ByMerchantIdOrderByCreatedAtDesc(Long merchantId);
}
