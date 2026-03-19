package com.upi.gateway.backend.repository;

import com.upi.gateway.backend.model.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {

    Optional<Merchant> findByEmail(String email);

    Optional<Merchant> findByApiKey(String apiKey);
}
