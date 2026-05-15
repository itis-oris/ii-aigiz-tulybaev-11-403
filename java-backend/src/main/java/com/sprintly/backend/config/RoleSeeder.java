package com.sprintly.backend.config;

import com.sprintly.backend.entity.Role;
import com.sprintly.backend.entity.enums.RoleName;
import com.sprintly.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        Arrays.stream(RoleName.values())
            .forEach(roleName -> roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build())));
    }
}
