package com.hamzajg.dynamicsoft.repositories;

import com.hamzajg.dynamicsoft.apis.TeamDto;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class TeamRepository {
    private final ConcurrentHashMap<String, TeamDto> storage = new ConcurrentHashMap<>();
    public List<TeamDto> findAll() { return new ArrayList<>(storage.values()); }
    public Optional<TeamDto> findById(String id) { return Optional.ofNullable(storage.get(id)); }
    public TeamDto save(TeamDto team) { storage.put(team.id, team); return team; }
}
