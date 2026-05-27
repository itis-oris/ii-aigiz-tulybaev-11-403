package com.sprintly.backend.repository;

import com.sprintly.backend.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {

    List<BoardColumn> findAllByBoard_IdAndDeletedAtIsNullOrderByPositionAsc(UUID boardId);

    Optional<BoardColumn> findByIdAndDeletedAtIsNull(UUID id);

    Optional<BoardColumn> findByIdAndBoard_IdAndDeletedAtIsNull(UUID id, UUID boardId);
}
