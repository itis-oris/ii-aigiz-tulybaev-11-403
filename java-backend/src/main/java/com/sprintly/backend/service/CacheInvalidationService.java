package com.sprintly.backend.service;

import com.sprintly.backend.config.CacheNames;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CacheInvalidationService {

    private final CacheManager cacheManager;

    public void evictProjectTags(UUID projectId) {
        evict(CacheNames.PROJECT_TAGS, projectId);
    }

    public void evictTag(UUID tagId) {
        evict(CacheNames.TAGS, tagId);
    }

    public void evictProjectFolders(UUID organizationId) {
        evict(CacheNames.PROJECT_FOLDERS, organizationId);
    }

    public void evictProjectBoards(UUID projectId) {
        evict(CacheNames.PROJECT_BOARDS, projectId);
    }

    public void evictBoard(UUID boardId) {
        evict(CacheNames.BOARDS, boardId);
    }

    public void evictBoardColumns(UUID boardId) {
        evict(CacheNames.BOARD_COLUMNS, boardId);
    }

    public void evictColumn(UUID columnId) {
        evict(CacheNames.COLUMNS, columnId);
    }

    private void evict(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null && key != null) {
            cache.evict(key);
        }
    }
}
