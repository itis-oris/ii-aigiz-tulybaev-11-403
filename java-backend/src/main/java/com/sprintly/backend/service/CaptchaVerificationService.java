package com.sprintly.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintly.backend.config.CaptchaProperties;
import com.sprintly.backend.integration.captcha.CaptchaVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaVerificationService {

    private final CaptchaProperties captchaProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public void verify(String captchaToken) {
        if (captchaToken == null || captchaToken.isBlank()) {
            throw new IllegalArgumentException("Captcha token is required");
        }

        if (captchaProperties.secret() == null || captchaProperties.secret().isBlank()) {
            throw new IllegalStateException("Captcha secret is not configured");
        }

        try {
            String responseBody = restClient.post()
                .uri(captchaProperties.verifyUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(buildRequestBody(captchaToken))
                .retrieve()
                .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                throw new IllegalStateException("Unable to verify captcha");
            }

            CaptchaVerificationResponse verificationResponse = objectMapper.readValue(
                responseBody,
                CaptchaVerificationResponse.class
            );

            if (!verificationResponse.success()) {
                List<String> errorCodes = verificationResponse.errorCodes() == null
                    ? List.of()
                    : verificationResponse.errorCodes();
                throw new IllegalArgumentException(
                    "Captcha verification failed" + (errorCodes.isEmpty() ? "" : ": " + String.join(", ", errorCodes))
                );
            }
        } catch (IOException | RestClientException ex) {
            log.error("Captcha API request failed", ex);
            throw new IllegalStateException("Unable to verify captcha", ex);
        }
    }

    private String buildRequestBody(String captchaToken) {
        return "secret=" + urlEncode(captchaProperties.secret())
            + "&response=" + urlEncode(captchaToken);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
