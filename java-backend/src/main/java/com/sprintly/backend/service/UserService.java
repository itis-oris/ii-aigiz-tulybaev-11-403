package com.sprintly.backend.service;

import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.UserMapper;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<UserResponse> findAllInCurrentOrganization(CustomUserDetails currentUser) {
        return userRepository.findAllByOrganization_Id(currentUser.getOrganizationId()).stream()
            .map(userMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId, CustomUserDetails currentUser) {
        var user = userRepository.findWithRolesById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOrganization() == null || !currentUser.getOrganizationId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        return userMapper.toResponse(user);
    }
}
