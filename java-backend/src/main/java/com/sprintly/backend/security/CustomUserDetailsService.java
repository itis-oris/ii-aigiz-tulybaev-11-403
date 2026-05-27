package com.sprintly.backend.security;

import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.service.OrganizationRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OrganizationRoleService organizationRoleService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findWithOrganizationsByEmail(username.toLowerCase().trim())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toUserDetails(user);
    }

    public UserDetails loadUserById(UUID userId) {
        User user = userRepository.findWithOrganizationsById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return toUserDetails(user);
    }

    private CustomUserDetails toUserDetails(User user) {
        UUID organizationId =
            user.getOrganization() != null && user.getOrganization().getDeletedAt() == null
                ? user.getOrganization().getId()
                : null;
        Set<SimpleGrantedAuthority> authorities = organizationRoleService.getAuthoritiesInOrganization(
            user,
            organizationId
        );

        return new CustomUserDetails(
            user.getId(),
            organizationId,
            user.getEmail(),
            user.getPasswordHash(),
            authorities
        );
    }
}
