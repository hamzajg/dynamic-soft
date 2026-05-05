package com.hamzajg.dynamicsoft.apis;

import com.hamzajg.dynamicsoft.services.ArchitectureContextService;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

@RestController
@RolesAllowed("user")
public class CodeGenChatController {

    private final OllamaChatClient chatClient;
    private final ArchitectureContextService contextService;

    @Autowired
    public CodeGenChatController(OllamaChatClient chatClient, ArchitectureContextService contextService) {
        this.chatClient = chatClient;
        this.contextService = contextService;
    }

    @GetMapping("/ai/generate")
    public Map<String, Object> generate(@RequestParam(value = "message", defaultValue = "Help") String message) {
        String context = contextService.getSystemContext();
        String systemPrompt = "You are an AI Architect. If your response suggests an architectural change, return it in this strict JSON format:\n" +
                "{ \"type\": \"ARCHITECTURAL_PROPOSAL\", \"proposalId\": \"uuid\", \"action\": \"...\", \"payload\": {...}, \"reasoning\": \"...\" }\n" +
                "Otherwise, return normal text.\n\n";
        String fullPrompt = systemPrompt + "Context:\n" + context + "\nUser Question: " + message;
        
        String response = chatClient.call(fullPrompt);
        // Simple check to see if AI returned JSON (basic implementation)
        if (response.contains("\"type\": \"ARCHITECTURAL_PROPOSAL\"")) {
            return Map.of("proposal", response);
        }
        return Map.of("generation", response);
    }
    
    // ... generateStream remains similar ...
}