package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.*;
import com.hamzajg.dynamicsoft.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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

    /**
     * Named listing of the current architecture entities — the grounding
     * payload for agent tools. Boards have no name field, so they list ids.
     */
    public String getEntityCatalog() {
        return "Projects: " + names(projectRepository.findAll(), p -> p.name, p -> p.id) + "\n" +
               "Solutions: " + names(solutionRepository.findAll(), s -> s.name, s -> s.id) + "\n" +
               "Diagrams: " + names(diagramRepository.findAll(), d -> d.name, d -> d.id) + "\n" +
               "Boards: " + boardRepository.findAll().stream().map(b -> b.id)
                       .collect(Collectors.joining(", ")) + "\n" +
               "Teams: " + names(teamRepository.findAll(), t -> t.name, t -> t.id);
    }

    private static <T> String names(List<T> items,
                                    java.util.function.Function<T, String> name,
                                    java.util.function.Function<T, String> id) {
        return items.stream()
                .map(i -> {
                    String n = name.apply(i);
                    String i2 = id.apply(i);
                    return n == null || n.isBlank() ? i2 : n + " (" + i2 + ")";
                })
                .collect(Collectors.joining(", "));
    }
}
