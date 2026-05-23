package com.sprintly.backend.repository;

import com.sprintly.backend.entity.ProjectFolder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectFolderRepository extends JpaRepository<ProjectFolder, UUID> {

    @EntityGraph(attributePaths = {"organization", "owner"})
    List<ProjectFolder> findAllByOrganization_IdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID organizationId);

    @EntityGraph(attributePaths = {"organization", "owner"})
    Optional<ProjectFolder> findByIdAndDeletedAtIsNull(UUID id);

}
