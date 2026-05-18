package com.sprintly.backend.service;

import com.sprintly.backend.config.S3Properties;
import com.sprintly.backend.exception.StorageUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3StorageService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final int MAX_S3_UPLOAD_ATTEMPTS = 4;
    private static final long S3_RETRY_DELAY_MILLIS = 250;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    public String uploadImage(MultipartFile file, String folder) {
        validateImage(file);

        String key = buildObjectKey(folder, file.getOriginalFilename());

        try {
            byte[] bytes = file.getBytes();
            PutObjectRequest request = PutObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .contentType(file.getContentType())
                .build();

            uploadWithRetry(request, bytes);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read uploaded file", ex);
        }

        return buildPublicUrl(key);
    }

    private void uploadWithRetry(PutObjectRequest request, byte[] bytes) {
        for (int attempt = 1; attempt <= MAX_S3_UPLOAD_ATTEMPTS; attempt++) {
            try {
                s3Client.putObject(request, RequestBody.fromBytes(bytes));
                return;
            } catch (S3Exception ex) {
                if (!isRetryableUploadConflict(ex) || attempt == MAX_S3_UPLOAD_ATTEMPTS) {
                    throw new StorageUnavailableException(
                        "Image storage is temporarily unavailable. Try again.",
                        ex
                    );
                }

                sleepBeforeRetry();
            }
        }
    }

    private boolean isRetryableUploadConflict(S3Exception ex) {
        return ex.statusCode() == 409;
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(S3_RETRY_DELAY_MILLIS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new StorageUnavailableException(
                "Image storage is temporarily unavailable. Try again.",
                ex
            );
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size must not exceed 5 MB");
        }

        String contentType = file.getContentType();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG and WEBP images are allowed");
        }
    }

    private String buildObjectKey(String folder, String originalFilename) {
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String normalizedExtension = extension == null ? "bin" : extension.toLowerCase(Locale.ROOT);

        return folder
            + "/"
            + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"))
            + "/"
            + UUID.randomUUID()
            + "."
            + normalizedExtension;
    }

    private String buildPublicUrl(String key) {
        if (s3Properties.publicBaseUrl() != null && !s3Properties.publicBaseUrl().isBlank()) {
            return s3Properties.publicBaseUrl().replaceAll("/+$", "") + "/" + key;
        }

        if (s3Properties.endpoint() != null && !s3Properties.endpoint().isBlank()) {
            return s3Properties.endpoint().replaceAll("/+$", "")
                + "/"
                + s3Properties.bucket()
                + "/"
                + key;
        }

        return "https://%s.s3.%s.amazonaws.com/%s".formatted(
            s3Properties.bucket(),
            s3Properties.region(),
            key
        );
    }
}
