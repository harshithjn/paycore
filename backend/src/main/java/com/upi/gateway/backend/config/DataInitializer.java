package com.upi.gateway.backend.config;

import com.upi.gateway.backend.model.Merchant;
import com.upi.gateway.backend.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Initialize sample data for testing
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Run before observer registration
public class DataInitializer implements CommandLineRunner {
    
    private final MerchantRepository merchantRepository;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing sample data...");
        
        // Create sample merchants if they don't exist
        if (merchantRepository.count() == 0) {
            createSampleMerchants();
        }
        
        log.info("Sample data initialization completed");
    }
    
    private void createSampleMerchants() {
        // Sample merchant 1
        Merchant merchant1 = Merchant.builder()
                .name("TechCorp Solutions")
                .email("admin@techcorp.com")
                .apiKey("pk_test_techcorp_12345")
                .webhookUrl("https://webhook.site/unique-id-1") // Test webhook URL
                .isActive(true)
                .build();
        
        // Sample merchant 2
        Merchant merchant2 = Merchant.builder()
                .name("E-Commerce Store")
                .email("payments@ecommerce.com")
                .apiKey("pk_test_ecommerce_67890")
                .webhookUrl("https://webhook.site/unique-id-2") // Test webhook URL
                .isActive(true)
                .build();
        
        // Sample merchant 3 (without webhook URL)
        Merchant merchant3 = Merchant.builder()
                .name("Local Business")
                .email("owner@localbiz.com")
                .apiKey("pk_test_localbiz_11111")
                .webhookUrl(null) // No webhook configured
                .isActive(true)
                .build();
        
        merchantRepository.save(merchant1);
        merchantRepository.save(merchant2);
        merchantRepository.save(merchant3);
        
        log.info("Created {} sample merchants", 3);
    }
}