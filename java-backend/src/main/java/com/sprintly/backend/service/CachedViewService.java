package com.sprintly.backend.service;

import com.sprintly.backend.config.CacheNames;
import com.sprintly.backend.dto.board.BoardResponse;
import com.sprintly.backend.dto.column.ColumnResponse;
import com.sprintly.backend.dto.projectfolder.ProjectFolderResponse;
import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.BoardColumn;
import com.sprintly.backend.entity.ProjectFolder;
import com.sprintly.backend.entity.Tag;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.BoardColumnMapper;
import com.sprintly.backend.mapper.BoardMapper;
import com.sprintly.backend.mapper.ProjectFolderMapper;
import com.sprintly.backend.mapper.TagMapper;
import com.sprintly.backend.repository.BoardColumnRepository;
import com.sprintly.backend.repository.BoardRepository;
import com.sprintly.backend.repository.ProjectFolderRepository;
import com.sprintly.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CachedViewService {

    private final TagRepository tagRepository;
    private final BoardRepository boardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final ProjectFolderRepository projectFolderRepository;
    private final TagMapper tagMapper;
    private final BoardMapper boardMapper;
    private final BoardColumnMapper boardColumnMapper;
    private final ProjectFolderMapper projectFolderMapper;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.PROJECT_TAGS, key = "#projectId")
    public List<TagResponse> getProjectTags(UUID projectId) {
        List<TagResponse> responses = new ArrayList<>();
        for (Tag tag : tagRepository.findAllByProject_IdAndDeletedAtIsNullOrderByNameAsc(projectId)) {
            responses.add(tagMapper.toResponse(tag));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.TAGS, key = "#tagId")
    public TagResponse getTag(UUID tagId) {
        Tag tag = tagRepository.findByIdAndDeletedAtIsNull(tagId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        return tagMapper.toResponse(tag);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.PROJECT_FOLDERS, key = "#organizationId")
    public List<ProjectFolderResponse> getProjectFolders(UUID organizationId) {
        List<ProjectFolderResponse> responses = new ArrayList<>();
        for (ProjectFolder folder : projectFolderRepository.findAllByOrganization_IdAndDeletedAtIsNullOrderByCreatedAtAsc(organizationId)) {
            responses.add(projectFolderMapper.toResponse(folder));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.PROJECT_BOARDS, key = "#projectId")
    public List<BoardResponse> getProjectBoards(UUID projectId) {
        List<BoardResponse> responses = new ArrayList<>();
        for (Board board : boardRepository.findAllByProject_IdAndDeletedAtIsNullOrderByPositionAsc(projectId)) {
            responses.add(boardMapper.toResponse(board));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.BOARDS, key = "#boardId")
    public BoardResponse getBoard(UUID boardId) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        return boardMapper.toResponse(board);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.BOARD_COLUMNS, key = "#boardId")
    public List<ColumnResponse> getBoardColumns(UUID boardId) {
        List<ColumnResponse> responses = new ArrayList<>();
        for (BoardColumn column : boardColumnRepository.findAllByBoard_IdAndDeletedAtIsNullOrderByPositionAsc(boardId)) {
            responses.add(boardColumnMapper.toResponse(column));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.COLUMNS, key = "#columnId")
    public ColumnResponse getColumn(UUID columnId) {
        BoardColumn column = boardColumnRepository.findByIdAndDeletedAtIsNull(columnId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        return boardColumnMapper.toResponse(column);
    }
}
