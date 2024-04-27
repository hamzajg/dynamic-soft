package com.hamzajg.dynamicsoft.apis;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    private final List<ProjectDto> projects = new ArrayList<>();

    @GetMapping
    public List<ProjectDto> getAllProjects() {
        return projects;
    }

    @PostMapping
    public ProjectDto createProject(@RequestBody ProjectDto projectDto) {
        projects.add(projectDto);
        return projectDto;
    }

}