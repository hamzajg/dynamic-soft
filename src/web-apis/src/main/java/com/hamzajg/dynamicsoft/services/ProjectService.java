package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.ProjectDto;
import com.hamzajg.dynamicsoft.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    private final ProjectRepository repository;
    @Autowired public ProjectService(ProjectRepository repository) { this.repository = repository; }
    public List<ProjectDto> getAll() { return repository.findAll(); }
    public ProjectDto create(ProjectDto dto) { return repository.save(dto); }
}
