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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final ProjectRepository projectRepository;
    private final BoardMapper boardMapper;
    private final ProjectAccessService projectAccessService;
    private final CachedViewService cachedViewService;
    private final CacheInvalidationService cacheInvalidationService;

    @Transactional
    public List<BoardResponse> findAllByProject(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for board access");
        List<Board> boards = boardRepository.findAllByProject_IdAndDeletedAtIsNullOrderByPositionAsc(project.getId());

        if (boards.isEmpty()) {
            createDefaultBoard(project);
        }
        return cachedViewService.getProjectBoards(project.getId());
    }

    @Transactional(readOnly = true)
    public BoardResponse findById(UUID boardId, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, board.getProject(), "Insufficient permissions for board access");
        return cachedViewService.getBoard(board.getId());
    }

    @Transactional
    public BoardResponse create(CreateBoardRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for board modification");
        String normalizedName = request.getName().trim();
        ensureUniqueBoardName(project.getId(), normalizedName);

        Board board = boardRepository.save(Board.builder()
            .name(normalizedName)
            .position(request.getPosition())
            .createdAt(OffsetDateTime.now())
            .project(project)
            .build());
        cacheInvalidationService.evictProjectBoards(project.getId());
        cacheInvalidationService.evictBoard(board.getId());

        return boardMapper.toResponse(board);
    }

    @Transactional
    public BoardResponse update(UUID boardId, UpdateBoardRequest request, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, board.getProject(), "Insufficient permissions for board modification");
        String normalizedName = request.getName().trim();
        ensureUniqueBoardName(board.getProject().getId(), normalizedName, board.getId());
        board.setName(normalizedName);
        board.setPosition(request.getPosition());
        Board savedBoard = boardRepository.save(board);
        cacheInvalidationService.evictProjectBoards(savedBoard.getProject().getId());
        cacheInvalidationService.evictBoard(savedBoard.getId());
        return boardMapper.toResponse(savedBoard);
    }

    @Transactional
    public void delete(UUID boardId, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, board.getProject(), "Insufficient permissions for board modification");
        board.setDeletedAt(OffsetDateTime.now());
        boardRepository.save(board);
        cacheInvalidationService.evictProjectBoards(board.getProject().getId());
        cacheInvalidationService.evictBoard(board.getId());
        cacheInvalidationService.evictBoardColumns(board.getId());
    }

    private Board getBoardInOrganization(UUID boardId, UUID organizationId) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (!belongsToOrganization(board, organizationId)) {
            throw new AccessDeniedException("Board does not belong to current organization");
        }

        return board;
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!belongsToOrganization(project, organizationId)) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private boolean belongsToOrganization(Board board, UUID organizationId) {
        return board.getProject() != null
            && belongsToOrganization(board.getProject(), organizationId);
    }

    private boolean belongsToOrganization(Project project, UUID organizationId) {
        return project.getOrganization() != null
            && organizationId.equals(project.getOrganization().getId());
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

    public Board createDefaultBoard(Project project) {
        Board board = boardRepository.save(Board.builder()
            .name("Main")
            .position(0L)
            .createdAt(OffsetDateTime.now())
            .project(project)
            .build());

        createDefaultColumn(board, "Backlog", 0L);
        createDefaultColumn(board, "In Progress", 1000L);
        createDefaultColumn(board, "Done", 2000L);
        cacheInvalidationService.evictProjectBoards(project.getId());
        cacheInvalidationService.evictBoard(board.getId());
        cacheInvalidationService.evictBoardColumns(board.getId());

        return board;
    }

    private void createDefaultColumn(Board board, String name, long position) {
        boardColumnRepository.save(BoardColumn.builder()
            .name(name)
            .position(position)
            .board(board)
            .build());
    }
}
