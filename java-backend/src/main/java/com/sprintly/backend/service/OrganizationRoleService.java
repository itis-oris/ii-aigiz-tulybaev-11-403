package com.sprintly.backend.service;

import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.OrganizationMemberRole;
import com.sprintly.backend.entity.Role;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.RoleName;
import com.sprintly.backend.repository.OrganizationMemberRoleRepository;
import com.sprintly.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationRoleService {

    private final OrganizationMemberRoleRepository organizationMemberRoleRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public Set<String> getRoleNamesInOrganization(User user, UUID organizationId) {
        if (organizationId == null) {
            return Set.of();
        }

        Set<String> roleNames = new HashSet<>();
        for (OrganizationMemberRole memberRole : organizationMemberRoleRepository.findAllByUser_IdAndOrganization_Id(
            user.getId(),
            organizationId
        )) {
            roleNames.add(memberRole.getRole().getName().name());
        }

        if (isOrganizationOwner(user, organizationId)) {
            roleNames.add(RoleName.ADMIN.name());
        }

        return roleNames;
    }

    @Transactional(readOnly = true)
    public Map<UUID, Set<String>> getRoleNamesByUserIdsInOrganization(
        UUID organizationId,
        Collection<UUID> userIds
    ) {
        Map<UUID, Set<String>> roleNamesByUserId = new HashMap<>();

        for (OrganizationMemberRole memberRole : organizationMemberRoleRepository.findAllByOrganization_IdAndUser_IdIn(
            organizationId,
            userIds
        )) {
            UUID userId = memberRole.getUser().getId();
            if (!roleNamesByUserId.containsKey(userId)) {
                roleNamesByUserId.put(userId, new HashSet<>());
            }
            roleNamesByUserId.get(userId).add(memberRole.getRole().getName().name());
        }

        return roleNamesByUserId;
    }

    @Transactional(readOnly = true)
    public Set<SimpleGrantedAuthority> getAuthoritiesInOrganization(User user, UUID organizationId) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        for (String roleName : getRoleNamesInOrganization(user, organizationId)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        }

        return authorities;
    }

    @Transactional
    public void assignRole(User user, Organization organization, RoleName roleName) {
        if (organizationMemberRoleRepository.existsByUser_IdAndOrganization_IdAndRole_Name(
            user.getId(),
            organization.getId(),
            roleName
        )) {
            return;
        }

        Role role = roleRepository.findByName(roleName)
            .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        organizationMemberRoleRepository.save(
            OrganizationMemberRole.builder()
                .organization(organization)
                .user(user)
                .role(role)
                .build()
        );
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
}
