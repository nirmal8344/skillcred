package com.adz4needz.skillcred.repository;

import com.adz4needz.skillcred.model.PaymentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentConfigRepository extends JpaRepository<PaymentConfig, Long> {
}
