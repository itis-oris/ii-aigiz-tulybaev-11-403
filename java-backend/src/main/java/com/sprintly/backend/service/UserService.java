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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final OrganizationRoleService organizationRoleService;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    public List<UserResponse> findAllInCurrentOrganization(CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        List<com.sprintly.backend.entity.User> users = userRepository.findAllByOrganizations_Id(currentUser.getOrganizationId());
        Map<UUID, Set<String>> roleNamesByUserId = new LinkedHashMap<>(
            organizationRoleService.getRoleNamesByUserIdsInOrganization(
                currentUser.getOrganizationId(),
                users.stream().map(com.sprintly.backend.entity.User::getId).toList()
            )
        );

        return users.stream()
            .map(user -> userMapper.toResponse(
                user,
                roleNamesByUserId.getOrDefault(
                    user.getId(),
                    organizationRoleService.getRoleNamesInOrganization(
                        user,
                        currentUser.getOrganizationId()
                    )
                )
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        var user = userRepository.findByIdAndOrganizations_Id(userId, currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toResponse(
            user,
            organizationRoleService.getRoleNamesInOrganization(user, currentUser.getOrganizationId())
        );
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file, CustomUserDetails currentUser) {
        var user = userRepository.findWithOrganizationsById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOrganization() == null || !currentUser.getOrganizationId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        String avatarUrl = s3StorageService.uploadImage(file, "users/" + user.getId() + "/avatar");
        user.setAvatarUrl(avatarUrl);

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(
            savedUser,
            organizationRoleService.getRoleNamesInOrganization(
                savedUser,
                currentUser.getOrganizationId()
            )
        );
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
