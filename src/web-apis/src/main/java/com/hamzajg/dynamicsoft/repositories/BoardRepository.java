package com.hamzajg.dynamicsoft.repositories;

import com.hamzajg.dynamicsoft.apis.BoardDto;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class BoardRepository {
    private final ConcurrentHashMap<String, BoardDto> storage = new ConcurrentHashMap<>();

    public List<BoardDto> findAll() {
        return new ArrayList<>(storage.values());
    }

    public Optional<BoardDto> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    public BoardDto save(BoardDto board) {
        storage.put(board.id, board);
        return board;
    }
}
