package com.sprintly.backend.repository;

import com.sprintly.backend.entity.ProjectMember;
import com.sprintly.backend.entity.enums.ProjectRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    boolean existsByProject_IdAndUser_Id(UUID projectId, UUID userId);

    Optional<ProjectMember> findByProject_IdAndUser_Id(UUID projectId, UUID userId);

    @EntityGraph(attributePaths = {"user"})
    List<ProjectMember> findAllByProject_Id(UUID projectId);

    void deleteByProject_IdAndUser_Id(UUID projectId, UUID userId);
}
