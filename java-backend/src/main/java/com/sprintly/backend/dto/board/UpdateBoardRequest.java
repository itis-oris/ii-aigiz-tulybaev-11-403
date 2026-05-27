package com.sprintly.backend.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBoardRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    private Long position;
}
