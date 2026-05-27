package com.sprintly.backend.repository;

import com.sprintly.backend.entity.OrganizationInvitation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, UUID> {

    @EntityGraph(attributePaths = {"organization", "invitedByUser", "acceptedByUser"})
    Optional<OrganizationInvitation> findByToken(String token);

    @EntityGraph(attributePaths = {"organization", "invitedByUser", "acceptedByUser"})
    List<OrganizationInvitation> findAllByOrganization_IdOrderByCreatedAtDesc(UUID organizationId);
}
