package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.DiagramDto;
import com.hamzajg.dynamicsoft.repositories.DiagramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiagramService {
    private final DiagramRepository repository;

    @Autowired public DiagramService(DiagramRepository repository) { this.repository = repository; }

    public List<DiagramDto> getAll() { return repository.findAll(); }
    public DiagramDto create(DiagramDto dto) { return repository.save(dto); }
    public Optional<DiagramDto> update(String id, DiagramDto dto) {
        return repository.findById(id).map(existing -> {
            return repository.save(existing);
        });
    }
}
