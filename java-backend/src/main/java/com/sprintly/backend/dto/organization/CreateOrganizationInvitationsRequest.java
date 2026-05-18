package com.sprintly.backend.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrganizationInvitationsRequest {

    private boolean createLinkInvitation;

    @Size(max = 50)
    private List<@Email @Size(max = 255) String> emails;
}
