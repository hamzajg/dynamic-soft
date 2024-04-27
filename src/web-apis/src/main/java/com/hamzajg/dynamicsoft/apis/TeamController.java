package com.hamzajg.dynamicsoft.apis;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {
    private final List<TeamDto> teams = new ArrayList<>();

    @GetMapping
    public List<TeamDto> getAllTeams() {
        return teams;
    }

    @PostMapping
    public TeamDto createTeam(@RequestBody TeamDto teamDto) {
        teams.add(teamDto);
        return teamDto;
    }

}