package com.hamzajg.dynamicsoft.repositories;

import com.hamzajg.dynamicsoft.apis.SolutionDto;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class SolutionRepository {
    private final ConcurrentHashMap<String, SolutionDto> storage = new ConcurrentHashMap<>();
    public List<SolutionDto> findAll() { return new ArrayList<>(storage.values()); }
    public Optional<SolutionDto> findById(String id) { return Optional.ofNullable(storage.get(id)); }
    public SolutionDto save(SolutionDto solution) { storage.put(solution.id, solution); return solution; }
}
