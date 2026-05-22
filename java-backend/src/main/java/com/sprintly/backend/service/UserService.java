package com.sprintly.backend.service;

import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.dto.user.UpdateCurrentUserRequest;
import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.UserMapper;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final UserMapper userMapper;
    private final OrganizationRoleService organizationRoleService;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    public List<UserResponse> findAllInCurrentOrganization(CustomUserDetails currentUser) {
        List<User> users = userRepository.findAllByOrganizations_Id(currentUser.getOrganizationId());
        List<UUID> userIds = new ArrayList<>();
        for (User user : users) {
            userIds.add(user.getId());
        }

        Map<UUID, Set<String>> roleNamesByUserId = new LinkedHashMap<>(
            organizationRoleService.getRoleNamesByUserIdsInOrganization(
                currentUser.getOrganizationId(),
                userIds
            )
        );
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (organization.getOwnerId() != null) {
            roleNamesByUserId
                .computeIfAbsent(organization.getOwnerId(), ignored -> new HashSet<>())
                .add("ADMIN");
        }

        List<UserResponse> responses = new ArrayList<>();
        for (User user : users) {
            responses.add(userMapper.toResponse(
                user,
                roleNamesByUserId.getOrDefault(
                    user.getId(),
                    organizationRoleService.getRoleNamesInOrganization(
                        user,
                        currentUser.getOrganizationId()
                    )
                )
            ));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId, CustomUserDetails currentUser) {
        User user = userRepository.findByIdAndOrganizations_Id(userId, currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toResponse(
            user,
            organizationRoleService.getRoleNamesInOrganization(user, currentUser.getOrganizationId())
        );
    }

    @Transactional
    public CurrentUserResponse updateCurrentUser(
        UpdateCurrentUserRequest request,
        CustomUserDetails currentUser
    ) {
        User user = userRepository.findWithOrganizationsById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstname(normalizeText(request.getFirstname()));
        user.setLastname(normalizeText(request.getLastname()));
        user.setMiddlename(normalizeText(request.getMiddlename()));
        user.setUpdatedAt(OffsetDateTime.now());

        return toCurrentUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file, CustomUserDetails currentUser) {
        User user = userRepository.findWithOrganizationsById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOrganization() == null || !currentUser.getOrganizationId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        String avatarUrl = s3StorageService.uploadImage(file, "users/" + user.getId() + "/avatar");
        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(OffsetDateTime.now());

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(
            savedUser,
            organizationRoleService.getRoleNamesInOrganization(
                savedUser,
                currentUser.getOrganizationId()
            )
        );
    }

    private CurrentUserResponse toCurrentUserResponse(User user) {
        Organization activeOrganization = getActiveOrganization(user);
        Set<Organization> organizations = new HashSet<>(user.getOrganizations());

        if (activeOrganization != null) {
            organizations.add(activeOrganization);
        }

        return CurrentUserResponse.builder()
            .userId(user.getId())
            .organizationId(activeOrganization != null ? activeOrganization.getId() : null)
            .email(user.getEmail())
            .firstname(user.getFirstname())
            .lastname(user.getLastname())
            .middlename(user.getMiddlename())
            .avatarUrl(user.getAvatarUrl())
            .organizationName(activeOrganization != null ? activeOrganization.getName() : null)
            .organizations(toOrganizationResponses(organizations, activeOrganization))
            .roles(
                activeOrganization != null
                    ? organizationRoleService.getRoleNamesInOrganization(
                        user,
                        activeOrganization.getId()
                    )
                    : Set.of()
            )
            .build();
    }

    private List<OrganizationResponse> toOrganizationResponses(
        Set<Organization> organizations,
        Organization activeOrganization
    ) {
        List<OrganizationResponse> responses = new ArrayList<>();
        for (Organization organization : organizations) {
            if (organization.getDeletedAt() != null) {
                continue;
            }

            responses.add(OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .ownerId(organization.getOwnerId())
                .createdAt(organization.getCreatedAt())
                .active(activeOrganization != null && organization.getId().equals(activeOrganization.getId()))
                .build());
        }

        return responses;
    }

    private Organization getActiveOrganization(User user) {
        if (user.getOrganization() == null || user.getOrganization().getDeletedAt() != null) {
            return null;
        }

        return user.getOrganization();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

}
