package com.hamzajg.dynamicsoft.repositories;

import com.hamzajg.dynamicsoft.apis.DiagramDto;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class DiagramRepository {
    private final ConcurrentHashMap<String, DiagramDto> storage = new ConcurrentHashMap<>();

    public List<DiagramDto> findAll() { return new ArrayList<>(storage.values()); }
    public Optional<DiagramDto> findById(String id) { return Optional.ofNullable(storage.get(id)); }
    public DiagramDto save(DiagramDto diagram) { storage.put(diagram.id, diagram); return diagram; }
}
