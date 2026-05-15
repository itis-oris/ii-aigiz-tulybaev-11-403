package com.sprintly.backend.converter;

import com.sprintly.backend.entity.enums.TaskStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;

@Component
public class StringToTaskStatusConverter implements Converter<String, TaskStatus> {

    @Override
    public TaskStatus convert(String source) {
        if (source == null) {
            return null;
        }

        String normalizedValue = source.trim().toUpperCase(Locale.ROOT);
        if (normalizedValue.isEmpty()) {
            return null;
        }

        try {
            return TaskStatus.valueOf(normalizedValue);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Unsupported task status '%s'. Allowed values: %s".formatted(
                    source,
                    Arrays.toString(TaskStatus.values())
                )
            );
        }
    }
}
