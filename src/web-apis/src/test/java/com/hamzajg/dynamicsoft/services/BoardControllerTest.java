package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.BoardDto;
import com.hamzajg.dynamicsoft.apis.BoardController;
import com.hamzajg.dynamicsoft.repositories.BoardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class BoardControllerTest {

    private BoardController controller;

    @BeforeEach
    void setUp() {
        controller = new BoardController(new BoardService(new BoardRepository()));
    }

    private BoardDto board(String id) {
        BoardDto dto = new BoardDto();
        dto.id = id;
        dto.nodes = "[]";
        dto.edges = "[]";
        return dto;
    }

    @Test
    void updateBoardReturnsUpdatedDto() {
        controller.createBoard(board("b1"));

        BoardDto update = board("b1");
        update.nodes = "[{\"id\":\"n1\"}]";

        BoardDto result = controller.updateBoard("b1", update);

        assertNotNull(result);
        assertEquals("[{\"id\":\"n1\"}]", result.nodes);
    }

    @Test
    void updateBoardThrows404ForUnknownId() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.updateBoard("missing", board("missing")));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
