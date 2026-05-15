package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByOrganization_IdAndDeletedAtIsNull(UUID organizationId);
}
