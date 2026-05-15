package com.sprintly.backend.service;

import com.sprintly.backend.config.S3Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
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
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(s3Properties.bucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .build(),
                RequestBody.fromBytes(file.getBytes())
            );
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read uploaded file", ex);
        }

        return buildPublicUrl(key);
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
