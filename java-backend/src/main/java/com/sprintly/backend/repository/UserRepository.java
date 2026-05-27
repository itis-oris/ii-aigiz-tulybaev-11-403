package com.sprintly.backend.repository;

import com.sprintly.backend.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    Optional<User> findWithOrganizationsByEmail(String email);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    Optional<User> findWithOrganizationsById(UUID id);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    List<User> findAllByOrganizations_Id(UUID organizationId);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    List<User> findAllByOrganization_Id(UUID organizationId);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    Optional<User> findByIdAndOrganizations_Id(UUID userId, UUID organizationId);

    @EntityGraph(attributePaths = {"organization", "organizations"})
    List<User> findAllByIdInAndOrganizations_Id(Set<UUID> userIds, UUID organizationId);
}
