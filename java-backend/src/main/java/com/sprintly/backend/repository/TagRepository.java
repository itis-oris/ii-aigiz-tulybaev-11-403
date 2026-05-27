package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Tag;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    @EntityGraph(attributePaths = {"project"})
    List<Tag> findAllByProject_IdAndDeletedAtIsNullOrderByNameAsc(UUID projectId);

    @EntityGraph(attributePaths = {"project"})
    Optional<Tag> findByIdAndDeletedAtIsNull(UUID tagId);

    @EntityGraph(attributePaths = {"project"})
    List<Tag> findAllByIdInAndDeletedAtIsNull(Collection<UUID> tagIds);

    boolean existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCase(UUID projectId, String name);

    boolean existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCaseAndIdNot(
        UUID projectId,
        String name,
        UUID tagId
    );
}
