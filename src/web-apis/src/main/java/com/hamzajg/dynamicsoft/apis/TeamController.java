package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.TeamService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/teams")
@RolesAllowed("user")
public class TeamController {
    private final TeamService teamService;

    @Autowired
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<TeamDto> getAll() {
        return teamService.getAll();
    }

    @PostMapping
    public TeamDto create(@RequestBody TeamDto dto) {
        return teamService.create(dto);
    }
}