package com.sprintly.backend.service;

import com.sprintly.backend.dto.board.BoardResponse;
import com.sprintly.backend.dto.board.CreateBoardRequest;
import com.sprintly.backend.dto.board.UpdateBoardRequest;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.BoardMapper;
import com.sprintly.backend.repository.BoardRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private static final String BOARDS_BY_PROJECT_CACHE = "boardsByProject";

    private final BoardRepository boardRepository;
    private final ProjectRepository projectRepository;
    private final BoardMapper boardMapper;

    @Transactional(readOnly = true)
    @Cacheable(value = BOARDS_BY_PROJECT_CACHE, key = "#projectId")
    public List<BoardResponse> findAllByProject(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        return boardRepository.findAllByProject_IdAndDeletedAtIsNullOrderByPositionAsc(project.getId()).stream()
            .map(boardMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BoardResponse findById(UUID boardId, CustomUserDetails currentUser) {
        return boardMapper.toResponse(getBoardInOrganization(boardId, currentUser.getOrganizationId()));
    }

    @Transactional
    @CacheEvict(value = BOARDS_BY_PROJECT_CACHE, key = "#request.projectId")
    public BoardResponse create(CreateBoardRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());

        Board board = boardRepository.save(Board.builder()
            .name(request.getName().trim())
            .position(request.getPosition())
            .createdAt(OffsetDateTime.now())
            .project(project)
            .build());

        return boardMapper.toResponse(board);
    }

    @Transactional
    @CacheEvict(value = BOARDS_BY_PROJECT_CACHE, allEntries = true)
    public BoardResponse update(UUID boardId, UpdateBoardRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        board.setName(request.getName().trim());
        board.setPosition(request.getPosition());
        return boardMapper.toResponse(boardRepository.save(board));
    }

    @Transactional
    @CacheEvict(value = BOARDS_BY_PROJECT_CACHE, allEntries = true)
    public void delete(UUID boardId, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        if (board.getDeletedAt() != null) {
            throw new IllegalStateException("Board already deleted");
        }
        board.setDeletedAt(OffsetDateTime.now());
        boardRepository.save(board);
    }

    private Board getBoardInOrganization(UUID boardId, UUID organizationId) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (board.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Board not found");
        }

        if (board.getProject() == null || board.getProject().getOrganization() == null
            || !organizationId.equals(board.getProject().getOrganization().getId())) {
            throw new AccessDeniedException("Board does not belong to current organization");
        }

        return board;
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Project not found");
        }

        if (project.getOrganization() == null || !organizationId.equals(project.getOrganization().getId())) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private void ensureManagerAccess(CustomUserDetails currentUser) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException("Недостаточно прав для изменения досок");
        }
    }
}
