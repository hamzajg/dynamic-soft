package com.hamzajg.dynamicsoft.apis;

import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/teams")
@RolesAllowed("user")
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