package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.SolutionService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/solutions")
@RolesAllowed("user")
public class SolutionController {
    private final SolutionService solutionService;

    @Autowired
    public SolutionController(SolutionService solutionService) {
        this.solutionService = solutionService;
    }

    @GetMapping
    public List<SolutionDto> getAll() {
        return solutionService.getAll();
    }

    @PostMapping
    public SolutionDto create(@RequestBody SolutionDto dto) {
        return solutionService.create(dto);
    }
}