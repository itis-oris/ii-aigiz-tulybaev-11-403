package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    List<Board> findAllByProject_IdAndDeletedAtIsNullOrderByPositionAsc(UUID projectId);

    boolean existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCase(UUID projectId, String name);

    boolean existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCaseAndIdNot(
        UUID projectId,
        String name,
        UUID id
    );
}
