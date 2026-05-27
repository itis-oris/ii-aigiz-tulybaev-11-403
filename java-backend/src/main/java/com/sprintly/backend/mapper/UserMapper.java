package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class UserMapper {

    public UserResponse toResponse(User user, Set<String> roles) {
        return UserResponse.builder()
            .id(user.getId())
            .firstname(user.getFirstname())
            .lastname(user.getLastname())
            .middlename(user.getMiddlename())
            .email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
            .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
            .roles(roles)
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
