package com.hamzajg.dynamicsoft.apis;

import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/solutions")
@RolesAllowed("user")
public class SolutionController {
    private final List<SolutionDto> solutions = new ArrayList<>();

    @GetMapping
    public List<SolutionDto> getAllSolutions() {
        return solutions;
    }

    @PostMapping
    public SolutionDto createSolution(@RequestBody SolutionDto solutionDto) {
        solutions.add(solutionDto);
        return solutionDto;
    }

}