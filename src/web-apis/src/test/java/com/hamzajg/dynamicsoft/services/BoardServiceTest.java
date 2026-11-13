package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.BoardDto;
import com.hamzajg.dynamicsoft.repositories.BoardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class BoardServiceTest {

    private BoardService service;

    @BeforeEach
    void setUp() {
        service = new BoardService(new BoardRepository());
    }

    private BoardDto board(String id) {
        BoardDto dto = new BoardDto();
        dto.id = id;
        dto.diagramId = "diagram-" + id;
        dto.nodes = "[]";
        dto.edges = "[]";
        return dto;
    }

    @Test
    void createThenGetAllReturnsBoard() {
        BoardDto created = service.createBoard(board("b1"));

        assertEquals(1, service.getAllBoards().size());
        assertSame(created, service.getAllBoards().get(0));
    }

    @Test
    void updateBoardMergesOnlyNodesAndEdges() {
        service.createBoard(board("b1"));

        BoardDto update = new BoardDto();
        update.id = "b1";
        update.diagramId = "should-be-ignored";
        update.nodes = "[{\"id\":\"n1\"}]";
        update.edges = "[{\"id\":\"e1\"}]";

        Optional<BoardDto> result = service.updateBoard("b1", update);

        assertTrue(result.isPresent());
        BoardDto saved = result.get();
        assertEquals("b1", saved.id);
        assertEquals("diagram-b1", saved.diagramId);
        assertEquals(update.nodes, saved.nodes);
        assertEquals(update.edges, saved.edges);
    }

    @Test
    void updateBoardReturnsEmptyForUnknownId() {
        assertTrue(service.updateBoard("missing", board("missing")).isEmpty());
    }
}
