package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.DiagramService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/diagrams")
@RolesAllowed("user")
public class DiagramController {
    private final DiagramService diagramService;

    @Autowired
    public DiagramController(DiagramService diagramService) {
        this.diagramService = diagramService;
    }

    @GetMapping
    public List<DiagramDto> getAll() {
        return diagramService.getAll();
    }

    @PostMapping
    public DiagramDto create(@RequestBody DiagramDto dto) {
        return diagramService.create(dto);
    }
}
}