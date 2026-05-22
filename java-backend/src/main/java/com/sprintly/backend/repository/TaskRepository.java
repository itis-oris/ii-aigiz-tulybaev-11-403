package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, TaskRepositoryCustom {

    @EntityGraph(attributePaths = {"project", "board", "column", "assignee", "creator", "tags"})
    Optional<Task> findById(UUID id);

    @EntityGraph(attributePaths = {"project", "board", "column", "assignee", "creator", "tags"})
    Optional<Task> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = {"project", "board", "column", "assignee", "creator", "tags"})
    @Query("""
        select distinct t
        from Task t
        join t.tags tag
        where t.deletedAt is null
          and t.project.organization.id = :organizationId
          and tag.id in :tagIds
        order by t.createdAt desc
        """)
    List<Task> findActiveTasksByOrganizationAndTagIds(UUID organizationId, Collection<UUID> tagIds);
}
