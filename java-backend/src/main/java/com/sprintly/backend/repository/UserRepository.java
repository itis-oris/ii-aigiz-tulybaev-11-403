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

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "organization", "organizations"})
    Optional<User> findWithRolesByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "organization", "organizations"})
    Optional<User> findWithRolesById(UUID id);

    @EntityGraph(attributePaths = {"roles", "organization", "organizations"})
    List<User> findAllByOrganizations_Id(UUID organizationId);

    @EntityGraph(attributePaths = {"roles", "organization", "organizations"})
    Optional<User> findByIdAndOrganizations_Id(UUID userId, UUID organizationId);

    @EntityGraph(attributePaths = {"roles", "organization", "organizations"})
    List<User> findAllByIdInAndOrganizations_Id(Set<UUID> userIds, UUID organizationId);
}
