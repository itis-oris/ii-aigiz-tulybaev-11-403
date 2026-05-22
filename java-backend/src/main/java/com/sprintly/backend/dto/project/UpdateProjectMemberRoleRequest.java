package com.sprintly.backend.dto.project;

import com.sprintly.backend.entity.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProjectMemberRoleRequest {

    @NotNull
    private ProjectRole role;
}
