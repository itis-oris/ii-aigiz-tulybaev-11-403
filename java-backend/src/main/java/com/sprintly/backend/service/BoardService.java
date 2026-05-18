package com.sprintly.backend.service;

import com.sprintly.backend.dto.board.BoardResponse;
import com.sprintly.backend.dto.board.CreateBoardRequest;
import com.sprintly.backend.dto.board.UpdateBoardRequest;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.BoardColumn;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.BoardMapper;
import com.sprintly.backend.repository.BoardColumnRepository;
import com.sprintly.backend.repository.BoardRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private static final String PROJECTS_BY_ORGANIZATION_CACHE = "projectsByOrganization";

    private final BoardRepository boardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final ProjectRepository projectRepository;
    private final BoardMapper boardMapper;

    @Transactional
    public List<BoardResponse> findAllByProject(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        List<Board> boards = boardRepository.findAllByProject_IdAndDeletedAtIsNullOrderByPositionAsc(project.getId());

        if (boards.isEmpty()) {
            boards = List.of(createDefaultBoard(project));
        }

        return boards.stream()
            .map(boardMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BoardResponse findById(UUID boardId, CustomUserDetails currentUser) {
        return boardMapper.toResponse(getBoardInOrganization(boardId, currentUser.getOrganizationId()));
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public BoardResponse create(CreateBoardRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, project);
        String normalizedName = request.getName().trim();
        ensureUniqueBoardName(project.getId(), normalizedName);

        Board board = boardRepository.save(Board.builder()
            .name(normalizedName)
            .position(request.getPosition())
            .createdAt(OffsetDateTime.now())
            .project(project)
            .build());

        return boardMapper.toResponse(board);
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public BoardResponse update(UUID boardId, UpdateBoardRequest request, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, board.getProject());
        String normalizedName = request.getName().trim();
        ensureUniqueBoardName(board.getProject().getId(), normalizedName, board.getId());
        board.setName(normalizedName);
        board.setPosition(request.getPosition());
        return boardMapper.toResponse(boardRepository.save(board));
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public void delete(UUID boardId, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, board.getProject());
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

    private void ensureManagerOrProjectMemberAccess(CustomUserDetails currentUser, Project project) {
        boolean isManager = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (isManager) {
            return;
        }

        boolean isOwner = project.getOwner() != null
            && currentUser.getId().equals(project.getOwner().getId());
        boolean isMember = project.getMembers().stream()
            .anyMatch(member -> currentUser.getId().equals(member.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException("Недостаточно прав для изменения досок");
        }
    }

    private void ensureUniqueBoardName(UUID projectId, String name) {
        if (boardRepository.existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCase(projectId, name)) {
            throw new IllegalArgumentException("Таблица с таким именем уже существует в проекте");
        }
    }

    private void ensureUniqueBoardName(UUID projectId, String name, UUID boardId) {
        if (boardRepository.existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCaseAndIdNot(projectId, name, boardId)) {
            throw new IllegalArgumentException("Таблица с таким именем уже существует в проекте");
        }
    }

    private Board createDefaultBoard(Project project) {
        Board board = boardRepository.save(Board.builder()
            .name("Main")
            .position(0L)
            .createdAt(OffsetDateTime.now())
            .project(project)
            .build());

        boardColumnRepository.save(BoardColumn.builder()
            .name("Backlog")
            .position(0L)
            .board(board)
            .build());
        boardColumnRepository.save(BoardColumn.builder()
            .name("In Progress")
            .position(1000L)
            .board(board)
            .build());
        boardColumnRepository.save(BoardColumn.builder()
            .name("Done")
            .position(2000L)
            .board(board)
            .build());

        return board;
    }
}
