package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.BoardService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/boards")
@RolesAllowed("user")
public class BoardController {
    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<BoardDto> getAllBoards() {
        return boardService.getAllBoards();
    }

    @PostMapping
    public BoardDto createBoard(@RequestBody BoardDto boardDto) {
        return boardService.createBoard(boardDto);
    }

    @PutMapping("/{id}")
    public BoardDto updateBoard(@PathVariable("id") String id, @RequestBody BoardDto boardDto) {
        return boardService.updateBoard(id, boardDto).orElse(null);
    }
}