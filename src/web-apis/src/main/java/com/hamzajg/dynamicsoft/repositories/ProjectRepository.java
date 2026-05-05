package com.hamzajg.dynamicsoft.repositories;

import com.hamzajg.dynamicsoft.apis.ProjectDto;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ProjectRepository {
    private final ConcurrentHashMap<String, ProjectDto> storage = new ConcurrentHashMap<>();
    public List<ProjectDto> findAll() { return new ArrayList<>(storage.values()); }
    public Optional<ProjectDto> findById(String id) { return Optional.ofNullable(storage.get(id)); }
    public ProjectDto save(ProjectDto project) { storage.put(project.id, project); return project; }
}
