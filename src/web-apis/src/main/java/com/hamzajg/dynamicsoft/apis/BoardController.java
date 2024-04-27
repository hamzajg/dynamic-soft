package com.hamzajg.dynamicsoft.apis;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/boards")
public class BoardController {
    private final List<BoardDto> boards = new ArrayList<>();

    @GetMapping
    public List<BoardDto> getAllBoards() {
        return boards;
    }

    @PostMapping
    public BoardDto createBoard(@RequestBody BoardDto boardDto) {
        boards.add(boardDto);
        return boardDto;
    }

    @PutMapping("/{id}")
    public BoardDto updateBoard(@PathVariable("id") String id, @RequestBody BoardDto boardDto) {
        BoardDto existingBoard = boards.stream()
                .filter(board -> board.id.equals(id))
                .findFirst()
                .orElse(null);
        if (existingBoard != null) {
            existingBoard.nodes = boardDto.nodes;
            existingBoard.edges = boardDto.edges;
        }
        return existingBoard;
    }
}