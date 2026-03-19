package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.PaymentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentLinkRepository extends JpaRepository<PaymentLink, UUID> {

    List<PaymentLink> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);

    Optional<PaymentLink> findByLinkCode(String linkCode);

    List<PaymentLink> findByMerchantIdAndStatus(Long merchantId, PaymentLink.LinkStatus status);
}
