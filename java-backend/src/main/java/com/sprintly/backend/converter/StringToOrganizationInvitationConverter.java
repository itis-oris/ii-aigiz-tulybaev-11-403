package com.sprintly.backend.converter;

import com.sprintly.backend.entity.OrganizationInvitation;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.OrganizationInvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StringToOrganizationInvitationConverter implements Converter<String, OrganizationInvitation> {

    private final OrganizationInvitationRepository organizationInvitationRepository;

    @Override
    public OrganizationInvitation convert(String source) {
        if (source == null) {
            return null;
        }

        String token = source.trim();
        if (token.isEmpty()) {
            return null;
        }

        return organizationInvitationRepository.findByToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
    }
}
