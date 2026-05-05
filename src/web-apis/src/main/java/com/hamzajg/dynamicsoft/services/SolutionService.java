package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.SolutionDto;
import com.hamzajg.dynamicsoft.repositories.SolutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolutionService {
    private final SolutionRepository repository;
    @Autowired public SolutionService(SolutionRepository repository) { this.repository = repository; }
    public List<SolutionDto> getAll() { return repository.findAll(); }
    public SolutionDto create(SolutionDto dto) { return repository.save(dto); }
}
