package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.*;
import com.hamzajg.dynamicsoft.repositories.*;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ArchitectureContextServiceTest {

    private ArchitectureContextService service(
            BoardRepository boards, DiagramRepository diagrams,
            ProjectRepository projects, SolutionRepository solutions,
            TeamRepository teams) {
        return new ArchitectureContextService(boards, diagrams, projects, solutions, teams);
    }

    @Test
    void emptyRepositoriesReportZeroCounts() {
        String context = service(new BoardRepository(), new DiagramRepository(),
                new ProjectRepository(), new SolutionRepository(), new TeamRepository())
                .getSystemContext();

        assertTrue(context.contains("Projects: 0"));
        assertTrue(context.contains("Solutions: 0"));
        assertTrue(context.contains("Diagrams: 0"));
        assertTrue(context.contains("Boards: 0"));
        assertTrue(context.contains("Teams: 0"));
    }

    @Test
    void countsReflectSeededEntities() {
        BoardRepository boards = new BoardRepository();
        DiagramRepository diagrams = new DiagramRepository();
        ProjectRepository projects = new ProjectRepository();
        SolutionRepository solutions = new SolutionRepository();
        TeamRepository teams = new TeamRepository();

        BoardDto board = new BoardDto();
        board.id = "b1";
        boards.save(board);

        DiagramDto diagram = new DiagramDto();
        diagram.id = "d1";
        diagrams.save(diagram);

        ProjectDto project = new ProjectDto();
        project.id = "p1";
        projects.save(project);

        SolutionDto solution = new SolutionDto();
        solution.id = "s1";
        solutions.save(solution);

        TeamDto team = new TeamDto();
        team.id = "t1";
        teams.save(team);

        String context = service(boards, diagrams, projects, solutions, teams).getSystemContext();

        assertTrue(context.contains("Projects: 1"));
        assertTrue(context.contains("Solutions: 1"));
        assertTrue(context.contains("Diagrams: 1"));
        assertTrue(context.contains("Boards: 1"));
        assertTrue(context.contains("Teams: 1"));
    }
}
