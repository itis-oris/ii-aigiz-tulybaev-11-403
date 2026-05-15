package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findAllByTask_IdOrderByCreatedAtAsc(UUID taskId);
}
