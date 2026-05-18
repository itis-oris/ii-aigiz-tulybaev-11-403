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
import java.util.stream.Collectors;

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

        return organizationMemberRoleRepository
            .findAllByUser_IdAndOrganization_Id(user.getId(), organizationId)
            .stream()
            .map(memberRole -> memberRole.getRole().getName().name())
            .collect(Collectors.toCollection(HashSet::new));
    }

    @Transactional(readOnly = true)
    public Map<UUID, Set<String>> getRoleNamesByUserIdsInOrganization(
        UUID organizationId,
        Collection<UUID> userIds
    ) {
        Map<UUID, Set<String>> roleNamesByUserId = new HashMap<>();

        organizationMemberRoleRepository.findAllByOrganization_IdAndUser_IdIn(
            organizationId,
            userIds
        ).forEach(memberRole -> roleNamesByUserId
            .computeIfAbsent(memberRole.getUser().getId(), ignored -> new HashSet<>())
            .add(memberRole.getRole().getName().name()));

        return roleNamesByUserId;
    }

    @Transactional(readOnly = true)
    public Set<SimpleGrantedAuthority> getAuthoritiesInOrganization(User user, UUID organizationId) {
        return getRoleNamesInOrganization(user, organizationId).stream()
            .map(roleName -> new SimpleGrantedAuthority("ROLE_" + roleName))
            .collect(Collectors.toCollection(HashSet::new));
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
}
