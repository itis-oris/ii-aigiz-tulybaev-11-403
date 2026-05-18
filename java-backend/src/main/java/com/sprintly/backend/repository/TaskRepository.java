package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID>, TaskRepositoryCustom {

    @EntityGraph(attributePaths = {"project", "board", "column", "assignee", "creator", "tags"})
    Optional<Task> findById(UUID id);

    List<Task> findAllByProject_IdAndDeletedAtIsNull(UUID projectId);

    List<Task> findAllByColumn_IdAndDeletedAtIsNullOrderByPositionAsc(UUID columnId);

    List<Task> findAllByAssignee_IdAndDeletedAtIsNull(UUID assigneeId);

    @Query("""
        select t
        from Task t
        where t.deletedAt is null
          and t.project.organization.id = :organizationId
          and t.status = :status
        order by t.createdAt desc
        """)
    List<Task> findActiveTasksByOrganizationAndStatus(UUID organizationId, TaskStatus status);
}
