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
import org.springframework.security.core.GrantedAuthority;
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

    @Transactional
    public List<ColumnResponse> findAllByBoard(UUID boardId, CustomUserDetails currentUser) {
        Board board = getBoardInOrganization(boardId, currentUser.getOrganizationId());
        List<BoardColumn> columns = boardColumnRepository.findAllByBoard_IdAndDeletedAtIsNullOrderByPositionAsc(board.getId());

        if (columns.isEmpty()) {
            columns = List.of(
                boardColumnRepository.save(BoardColumn.builder().name("Backlog").position(0L).board(board).build()),
                boardColumnRepository.save(BoardColumn.builder().name("In Progress").position(1000L).board(board).build()),
                boardColumnRepository.save(BoardColumn.builder().name("Done").position(2000L).board(board).build())
            );
        }

        return columns.stream()
            .map(boardColumnMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ColumnResponse findById(UUID columnId, CustomUserDetails currentUser) {
        return boardColumnMapper.toResponse(getColumnInOrganization(columnId, currentUser.getOrganizationId()));
    }

    @Transactional
    public ColumnResponse create(CreateColumnRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        Board board = getBoardInOrganization(request.getBoardId(), currentUser.getOrganizationId());

        BoardColumn column = boardColumnRepository.save(BoardColumn.builder()
            .name(request.getName().trim())
            .position(request.getPosition())
            .board(board)
            .build());

        return boardColumnMapper.toResponse(column);
    }

    @Transactional
    public ColumnResponse update(UUID columnId, UpdateColumnRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        BoardColumn column = getColumnInOrganization(columnId, currentUser.getOrganizationId());
        column.setName(request.getName().trim());
        column.setPosition(request.getPosition());
        return boardColumnMapper.toResponse(boardColumnRepository.save(column));
    }

    @Transactional
    public void delete(UUID columnId, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);
        BoardColumn column = getColumnInOrganization(columnId, currentUser.getOrganizationId());
        if (column.getDeletedAt() != null) {
            throw new IllegalStateException("Column already deleted");
        }
        column.setDeletedAt(OffsetDateTime.now());
        boardColumnRepository.save(column);
    }

    private BoardColumn getColumnInOrganization(UUID columnId, UUID organizationId) {
        BoardColumn column = boardColumnRepository.findById(columnId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found"));

        if (column.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Column not found");
        }

        if (column.getBoard() == null || column.getBoard().getProject() == null
            || column.getBoard().getProject().getOrganization() == null
            || !organizationId.equals(column.getBoard().getProject().getOrganization().getId())) {
            throw new AccessDeniedException("Column does not belong to current organization");
        }

        return column;
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

    private void ensureManagerAccess(CustomUserDetails currentUser) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException("Недостаточно прав для изменения колонок");
        }
    }
}
