package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.ProjectService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/projects")
@RolesAllowed("user")
public class ProjectController {
    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDto> getAll() {
        return projectService.getAll();
    }

    @PostMapping
    public ProjectDto create(@RequestBody ProjectDto dto) {
        return projectService.create(dto);
    }
}