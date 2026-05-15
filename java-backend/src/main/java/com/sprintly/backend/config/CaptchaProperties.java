package com.sprintly.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.captcha")
public record CaptchaProperties(
    String verifyUrl,
    String secret
) {
}
