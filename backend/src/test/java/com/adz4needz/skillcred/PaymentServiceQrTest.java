package com.adz4needz.skillcred;

import com.adz4needz.skillcred.dto.PaymentConfigDto;
import com.adz4needz.skillcred.model.PaymentConfig;
import com.adz4needz.skillcred.repository.PaymentConfigRepository;
import com.adz4needz.skillcred.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class PaymentServiceQrTest {

    private PaymentConfigRepository paymentConfigRepository;
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentConfigRepository = Mockito.mock(PaymentConfigRepository.class);
        paymentService = new PaymentService(
                paymentConfigRepository,
                null,
                null,
                null,
                null,
                null
        );
        when(paymentConfigRepository.findById(1L)).thenReturn(Optional.of(new PaymentConfig()));
        when(paymentConfigRepository.save(any(PaymentConfig.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void testValidQrImageFormats() {
        String validPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        PaymentConfigDto res = paymentService.updateQrImage(validPng);
        assertNotNull(res);
        assertEquals(validPng, res.getQrImageUrl());

        String validWebp = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
        res = paymentService.updateQrImage(validWebp);
        assertNotNull(res);
        assertEquals(validWebp, res.getQrImageUrl());

        // Can clear to revert to dynamic QR
        res = paymentService.updateQrImage("");
        assertNotNull(res);
        assertEquals("", res.getQrImageUrl());
    }

    @Test
    void testInvalidQrImageFormatThrowsException() {
        String invalidGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        assertThrows(IllegalArgumentException.class, () -> paymentService.updateQrImage(invalidGif));

        String invalidExec = "data:application/pdf;base64,JVBERi0xLjUK";
        assertThrows(IllegalArgumentException.class, () -> paymentService.updateQrImage(invalidExec));
    }

    @Test
    void testOversizedQrImageThrowsException() {
        StringBuilder large = new StringBuilder("data:image/png;base64,");
        for (int i = 0; i < 7_000_001; i++) {
            large.append("A");
        }
        assertThrows(IllegalArgumentException.class, () -> paymentService.updateQrImage(large.toString()));
    }
}
