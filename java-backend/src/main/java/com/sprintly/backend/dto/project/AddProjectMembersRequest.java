package com.sprintly.backend.dto.project;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AddProjectMembersRequest {

    @NotEmpty
    private List<@NotNull UUID> userIds;
}
