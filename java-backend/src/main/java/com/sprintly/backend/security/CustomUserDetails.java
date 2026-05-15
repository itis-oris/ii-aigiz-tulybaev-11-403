package com.sprintly.backend.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID id;
    private final UUID organizationId;
    private final String email;
    private final String password;
    private final Set<SimpleGrantedAuthority> authorities;

    public CustomUserDetails(UUID id, UUID organizationId, String email, String password, Set<SimpleGrantedAuthority> authorities) {
        this.id = id;
        this.organizationId = organizationId;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
