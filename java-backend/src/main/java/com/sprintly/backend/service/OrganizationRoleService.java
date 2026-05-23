package com.sprintly.backend.service;

import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.RoleName;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationRoleService {

    @Transactional(readOnly = true)
    public Set<String> getRoleNamesInOrganization(User user, UUID organizationId) {
        if (user == null || organizationId == null) {
            return Set.of();
        }

        Set<String> roleNames = new HashSet<>();

        if (!isOrganizationMember(user, organizationId)) {
            return roleNames;
        }

        if (isOrganizationOwner(user, organizationId)) {
            roleNames.add(RoleName.OWNER.name());
        }

        roleNames.add(RoleName.MEMBER.name());

        return roleNames;
    }

    @Transactional(readOnly = true)
    public Set<SimpleGrantedAuthority> getAuthoritiesInOrganization(User user, UUID organizationId) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        for (String roleName : getRoleNamesInOrganization(user, organizationId)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        }

        return authorities;
    }

    private boolean isOrganizationOwner(User user, UUID organizationId) {
        if (user.getOrganization() != null
            && organizationId.equals(user.getOrganization().getId())
            && user.getOrganization().getOwnerId() != null
            && user.getOrganization().getOwnerId().equals(user.getId())) {
            return true;
        }

        for (Organization organization : user.getOrganizations()) {
            if (organizationId.equals(organization.getId())
                && organization.getOwnerId() != null
                && organization.getOwnerId().equals(user.getId())) {
                return true;
            }
        }

        return false;
    }

    private boolean isOrganizationMember(User user, UUID organizationId) {
        if (user.getOrganization() != null
            && organizationId.equals(user.getOrganization().getId())
            && user.getOrganization().getDeletedAt() == null) {
            return true;
        }

        for (Organization organization : user.getOrganizations()) {
            if (organizationId.equals(organization.getId()) && organization.getDeletedAt() == null) {
                return true;
            }
        }

        return false;
    }
}
