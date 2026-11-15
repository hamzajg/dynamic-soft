package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.AgentToolRegistry;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Agent-facing tool surface for CLI/IDE clients.
 * GET  /api/agent/tools      — list available tools + parameter schemas
 * POST /api/agent/tools/call — invoke a tool: {"tool": "...", "input": {...}}
 */
@RestController
@RequestMapping("/api/agent")
public class AgentToolController {

    private final AgentToolRegistry registry;

    public AgentToolController(AgentToolRegistry registry) {
        this.registry = registry;
    }

    @GetMapping("/tools")
    public List<AgentToolInfo> listTools() {
        return registry.list();
    }

    @PostMapping("/tools/call")
    public ResponseEntity<AgentToolResult> callTool(@RequestBody AgentToolCall call) {
        if (call == null || call.tool() == null || call.tool().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new AgentToolResult(null, false, null, "tool name required"));
        }
        AgentToolResult result = registry.call(call.tool(), call.input());
        if (!result.ok()) {
            if (result.error() != null && result.error().startsWith("unknown tool")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
            if (result.error() != null && result.error().startsWith("missing required")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(result);
        }
        return ResponseEntity.ok(result);
    }
}
