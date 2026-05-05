package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class ArchitectureContextService {
    private final BoardRepository boardRepository;
    private final DiagramRepository diagramRepository;
    private final ProjectRepository projectRepository;
    private final SolutionRepository solutionRepository;
    private final TeamRepository teamRepository;

    @Autowired
    public ArchitectureContextService(BoardRepository boardRepository, 
                                      DiagramRepository diagramRepository,
                                      ProjectRepository projectRepository,
                                      SolutionRepository solutionRepository,
                                      TeamRepository teamRepository) {
        this.boardRepository = boardRepository;
        this.diagramRepository = diagramRepository;
        this.projectRepository = projectRepository;
        this.solutionRepository = solutionRepository;
        this.teamRepository = teamRepository;
    }

    public String getSystemContext() {
        return "System Architecture State:\n" +
               "Projects: " + projectRepository.findAll().size() + "\n" +
               "Solutions: " + solutionRepository.findAll().size() + "\n" +
               "Diagrams: " + diagramRepository.findAll().size() + "\n" +
               "Boards: " + boardRepository.findAll().size() + "\n" +
               "Teams: " + teamRepository.findAll().size() + "\n";
    }
}
