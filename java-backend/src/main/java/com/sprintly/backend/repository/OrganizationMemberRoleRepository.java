package com.sprintly.backend.repository;

import com.sprintly.backend.entity.OrganizationMemberRole;
import com.sprintly.backend.entity.enums.RoleName;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface OrganizationMemberRoleRepository extends JpaRepository<OrganizationMemberRole, UUID> {

    @EntityGraph(attributePaths = {"role"})
    List<OrganizationMemberRole> findAllByUser_IdAndOrganization_Id(UUID userId, UUID organizationId);

    @EntityGraph(attributePaths = {"role"})
    List<OrganizationMemberRole> findAllByOrganization_IdAndUser_IdIn(
        UUID organizationId,
        Collection<UUID> userIds
    );

    boolean existsByUser_IdAndOrganization_IdAndRole_Name(
        UUID userId,
        UUID organizationId,
        RoleName roleName
    );
}
