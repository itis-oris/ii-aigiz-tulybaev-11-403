package com.sprintly.backend.integration.captcha;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record CaptchaVerificationResponse(
    boolean success,
    @JsonProperty("error-codes") List<String> errorCodes
) {
}
