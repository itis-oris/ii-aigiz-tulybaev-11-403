package com.sprintly.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
            .disableCachingNullValues()
            .entryTtl(Duration.ofMinutes(10))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer(objectMapper)
                )
            );

        Map<String, RedisCacheConfiguration> cacheConfigurations = Map.of(
            CacheNames.PROJECT_TAGS, cacheConfiguration.entryTtl(Duration.ofMinutes(15)),
            CacheNames.TAGS, cacheConfiguration.entryTtl(Duration.ofMinutes(15)),
            CacheNames.PROJECT_FOLDERS, cacheConfiguration.entryTtl(Duration.ofMinutes(15)),
            CacheNames.PROJECT_BOARDS, cacheConfiguration.entryTtl(Duration.ofMinutes(10)),
            CacheNames.BOARDS, cacheConfiguration.entryTtl(Duration.ofMinutes(10)),
            CacheNames.BOARD_COLUMNS, cacheConfiguration.entryTtl(Duration.ofMinutes(10)),
            CacheNames.COLUMNS, cacheConfiguration.entryTtl(Duration.ofMinutes(10))
        );

        return RedisCacheManager.builder(connectionFactory)
            .transactionAware()
            .cacheDefaults(cacheConfiguration)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
