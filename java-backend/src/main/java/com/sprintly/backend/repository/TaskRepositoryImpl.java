package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.enums.TaskStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class TaskRepositoryImpl implements TaskRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Task> findByFilters(
        UUID organizationId,
        UUID projectId,
        UUID assigneeId,
        UUID creatorId,
        TaskStatus status,
        Integer priority,
        String search,
        Collection<UUID> tagIds
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Task> cq = cb.createQuery(Task.class);
        Root<Task> task = cq.from(Task.class);
        task.fetch("project", JoinType.LEFT);
        task.fetch("board", JoinType.LEFT);
        task.fetch("column", JoinType.LEFT);
        task.fetch("assignee", JoinType.LEFT);
        task.fetch("creator", JoinType.LEFT);
        task.fetch("tags", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.isNull(task.get("deletedAt")));

        Subquery<UUID> projectSubquery = cq.subquery(UUID.class);
        Root<Project> project = projectSubquery.from(Project.class);
        projectSubquery.select(project.get("id"))
            .where(
                cb.equal(project.get("organization").get("id"), organizationId),
                cb.isNull(project.get("deletedAt"))
            );
        predicates.add(task.get("project").get("id").in(projectSubquery));

        if (projectId != null) {
            predicates.add(cb.equal(task.get("project").get("id"), projectId));
        }

        if (assigneeId != null) {
            predicates.add(cb.equal(task.get("assignee").get("id"), assigneeId));
        }

        if (creatorId != null) {
            predicates.add(cb.equal(task.get("creator").get("id"), creatorId));
        }

        if (status != null) {
            predicates.add(cb.equal(task.get("status"), status));
        }

        if (priority != null) {
            predicates.add(cb.equal(task.get("priority"), priority));
        }

        if (StringUtils.hasText(search)) {
            predicates.add(cb.like(cb.lower(task.get("title")), "%" + search.toLowerCase() + "%"));
        }

        if (tagIds != null && !tagIds.isEmpty()) {
            predicates.add(task.join("tags", JoinType.LEFT).get("id").in(tagIds));
        }

        cq.select(task)
            .distinct(true)
            .where(predicates.toArray(new Predicate[0]))
            .orderBy(cb.asc(task.get("position")), cb.desc(task.get("createdAt")));

        TypedQuery<Task> query = entityManager.createQuery(cq);
        return query.getResultList();
    }
}
