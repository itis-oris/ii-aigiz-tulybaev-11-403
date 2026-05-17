package com.sprintly.backend.service;

import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.UserMapper;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    public List<UserResponse> findAllInCurrentOrganization(CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        return userRepository.findAllByOrganizations_Id(currentUser.getOrganizationId()).stream()
            .map(userMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        var user = userRepository.findByIdAndOrganizations_Id(userId, currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file, CustomUserDetails currentUser) {
        var user = userRepository.findWithRolesById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOrganization() == null || !currentUser.getOrganizationId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        String avatarUrl = s3StorageService.uploadImage(file, "users/" + user.getId() + "/avatar");
        user.setAvatarUrl(avatarUrl);

        return userMapper.toResponse(userRepository.save(user));
    }

    private void ensureManagerAccess(CustomUserDetails currentUser) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException("Insufficient permissions for user management");
        }
    }
}
