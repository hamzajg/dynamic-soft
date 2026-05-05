package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.BoardDto;
import com.hamzajg.dynamicsoft.repositories.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoardService {
    private final BoardRepository repository;

    @Autowired
    public BoardService(BoardRepository repository) {
        this.repository = repository;
    }

    public List<BoardDto> getAllBoards() {
        return repository.findAll();
    }

    public BoardDto createBoard(BoardDto board) {
        return repository.save(board);
    }

    public Optional<BoardDto> updateBoard(String id, BoardDto board) {
        return repository.findById(id).map(existing -> {
            existing.nodes = board.nodes;
            existing.edges = board.edges;
            return repository.save(existing);
        });
    }
}
