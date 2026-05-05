package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.TeamDto;
import com.hamzajg.dynamicsoft.repositories.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamService {
    private final TeamRepository repository;
    @Autowired public TeamService(TeamRepository repository) { this.repository = repository; }
    public List<TeamDto> getAll() { return repository.findAll(); }
    public TeamDto create(TeamDto dto) { return repository.save(dto); }
}
