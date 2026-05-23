package com.sprintly.backend.service;

import com.sprintly.backend.dto.column.ColumnResponse;
import com.sprintly.backend.dto.column.CreateColumnRequest;
import com.sprintly.backend.dto.column.UpdateColumnRequest;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.BoardColumn;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.BoardColumnMapper;
import com.sprintly.backend.repository.BoardColumnRepository;
import com.sprintly.backend.repository.BoardRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardColumnService {

    private final BoardColumnRepository boardColumnRepository;
    private final BoardRepository boardRepository;
    private final BoardColumnMapper boardColumnMapper;
    private final ProjectAccessService projectAccessService;
    private final CachedViewService cachedViewService;
    private final CacheInvalidationService cacheInvalidationService;

    @Transactional
    public List<ColumnResponse> findAllByBoard(UUID boardId, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, board.getProject(), "Insufficient permissions for column access");
        List<BoardColumn> columns = boardColumnRepository.findAllByBoard_IdAndDeletedAtIsNullOrderByPositionAsc(board.getId());

        if (columns.isEmpty()) {
            createDefaultColumns(board);
        }
        return cachedViewService.getBoardColumns(board.getId());
    }

    @Transactional(readOnly = true)
    public ColumnResponse findById(UUID columnId, CustomUserDetails currentUser) {
        BoardColumn column = getColumnInOrganization(columnId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, column.getBoard().getProject(), "Insufficient permissions for column access");
        return cachedViewService.getColumn(column.getId());
    }

    @Transactional
    public ColumnResponse create(CreateColumnRequest request, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(request.getBoardId(), currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, board.getProject(), "Insufficient permissions for column modification");

        BoardColumn column = boardColumnRepository.save(BoardColumn.builder()
            .name(request.getName().trim())
            .position(request.getPosition())
            .board(board)
            .build());
        cacheInvalidationService.evictBoardColumns(board.getId());
        cacheInvalidationService.evictColumn(column.getId());

        return boardColumnMapper.toResponse(column);
    }

    @Transactional
    public ColumnResponse update(UUID columnId, UpdateColumnRequest request, CustomUserDetails currentUser) {
        BoardColumn column = getColumnInOrganization(columnId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, column.getBoard().getProject(), "Insufficient permissions for column modification");
        column.setName(request.getName().trim());
        column.setPosition(request.getPosition());
        BoardColumn savedColumn = boardColumnRepository.save(column);
        cacheInvalidationService.evictBoardColumns(savedColumn.getBoard().getId());
        cacheInvalidationService.evictColumn(savedColumn.getId());
        return boardColumnMapper.toResponse(savedColumn);
    }

    @Transactional
    public void delete(UUID columnId, CustomUserDetails currentUser) {
        BoardColumn column = getColumnInOrganization(columnId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, column.getBoard().getProject(), "Insufficient permissions for column modification");
        column.setDeletedAt(OffsetDateTime.now());
        boardColumnRepository.save(column);
        cacheInvalidationService.evictBoardColumns(column.getBoard().getId());
        cacheInvalidationService.evictColumn(column.getId());
    }

    private BoardColumn getColumnInOrganization(UUID columnId, UUID organizationId) {
        BoardColumn column = boardColumnRepository.findByIdAndDeletedAtIsNull(columnId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found"));

        if (!belongsToOrganization(column, organizationId)) {
            throw new AccessDeniedException("Column does not belong to current organization");
        }

        return column;
    }

    private Board getBoardInOrganization(UUID boardId, UUID organizationId) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (!belongsToOrganization(board, organizationId)) {
            throw new AccessDeniedException("Board does not belong to current organization");
        }

        return board;
    }

    private boolean belongsToOrganization(BoardColumn column, UUID organizationId) {
        return column.getBoard() != null
            && belongsToOrganization(column.getBoard(), organizationId);
    }

    private boolean belongsToOrganization(Board board, UUID organizationId) {
        return board.getProject() != null
            && board.getProject().getOrganization() != null
            && organizationId.equals(board.getProject().getOrganization().getId());
    }

    private List<BoardColumn> createDefaultColumns(Board board) {
        List<BoardColumn> columns = List.of(
            createDefaultColumn(board, "Backlog", 0L),
            createDefaultColumn(board, "In Progress", 1000L),
            createDefaultColumn(board, "Done", 2000L)
        );
        cacheInvalidationService.evictBoardColumns(board.getId());
        return columns;
    }

    private BoardColumn createDefaultColumn(Board board, String name, long position) {
        return boardColumnRepository.save(BoardColumn.builder()
            .name(name)
            .position(position)
            .board(board)
            .build());
    }

}
