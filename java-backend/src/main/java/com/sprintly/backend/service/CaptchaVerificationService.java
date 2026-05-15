package com.sprintly.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintly.backend.config.CaptchaProperties;
import com.sprintly.backend.integration.captcha.CaptchaVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaVerificationService {

    private final CaptchaProperties captchaProperties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void verify(String captchaToken) {
        if (captchaToken == null || captchaToken.isBlank()) {
            throw new IllegalArgumentException("Captcha token is required");
        }

        if (captchaProperties.secret() == null || captchaProperties.secret().isBlank()) {
            throw new IllegalStateException("Captcha secret is not configured");
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(captchaProperties.verifyUrl()))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(buildRequestBody(captchaToken)))
            .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Captcha API returned status {}", response.statusCode());
                throw new IllegalStateException("Unable to verify captcha");
            }

            CaptchaVerificationResponse verificationResponse = objectMapper.readValue(
                response.body(),
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
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
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
