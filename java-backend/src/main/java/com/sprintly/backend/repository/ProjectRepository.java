package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Project;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @EntityGraph(attributePaths = {"organization", "owner", "folder", "boards"})
    List<Project> findAllByOrganization_IdAndDeletedAtIsNull(UUID organizationId);

    @EntityGraph(attributePaths = {"organization", "owner", "folder", "boards"})
    Optional<Project> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = {"organization", "owner", "folder", "members", "boards"})
    Optional<Project> findWithMembersByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = {"organization", "owner", "folder", "boards"})
    List<Project> findAllByFolder_IdAndDeletedAtIsNull(UUID folderId);
}
