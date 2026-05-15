package com.sprintly.backend.security;

import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findWithRolesByEmail(username.toLowerCase().trim())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toUserDetails(user);
    }

    public UserDetails loadUserById(UUID userId) {
        User user = userRepository.findWithRolesById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return toUserDetails(user);
    }

    private CustomUserDetails toUserDetails(User user) {
        Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
            .collect(Collectors.toSet());

        return new CustomUserDetails(
            user.getId(),
            user.getOrganization().getId(),
            user.getEmail(),
            user.getPasswordHash(),
            authorities
        );
    }
}
