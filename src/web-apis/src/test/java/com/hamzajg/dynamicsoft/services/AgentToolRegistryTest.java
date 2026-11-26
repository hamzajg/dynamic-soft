package com.hamzajg.dynamicsoft.services;

import com.hamzajg.dynamicsoft.apis.*;
import com.hamzajg.dynamicsoft.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AgentToolRegistryTest {

    private OllamaChatModel chatClient;
    private AgentToolRegistry registry;
    private ArchitectureContextService contextService;

    @BeforeEach
    void setUp() {
        chatClient = mock(OllamaChatModel.class);
        when(chatClient.call(any(Prompt.class))).thenReturn(
                new ChatResponse(List.of(new Generation(new org.springframework.ai.chat.messages.AssistantMessage("llm-output")))));
        contextService = new ArchitectureContextService(
                new BoardRepository(), new DiagramRepository(),
                new ProjectRepository(), new SolutionRepository(),
                new TeamRepository());
        registry = new AgentToolRegistry(chatClient, contextService);
    }

    @Test
    void listExposesAllToolsWithSchemas() {
        List<AgentToolInfo> tools = registry.list();

        assertEquals(3, tools.size());
        assertTrue(tools.stream().anyMatch(t -> t.name().equals("architecture_context")));
        AgentToolInfo gen = tools.stream()
                .filter(t -> t.name().equals("generate_code")).findFirst().orElseThrow();
        @SuppressWarnings("unchecked")
        List<String> required = (List<String>) gen.parameters().get("required");
        assertTrue(required.contains("prompt"));
    }

    @Test
    void architectureContextIsDeterministicAndGrounded() {
        AgentToolResult result = registry.call("architecture_context", Map.of());

        assertTrue(result.ok());
        assertTrue(result.output().contains("Projects: 0"));
        assertTrue(result.output().contains("Catalog:"));
        verifyNoInteractions(chatClient);
    }

    @Test
    void architectureAdviceInjectsSystemContext() {
        registry.call("architecture_advice", Map.of("question", "is this modular?"));

        ArgumentCaptor<Prompt> captor = ArgumentCaptor.forClass(Prompt.class);
        verify(chatClient).call(captor.capture());
        String userMessage = captor.getValue().getInstructions().get(1).getText();
        assertTrue(userMessage.contains("System Architecture State"));
        assertTrue(userMessage.contains("is this modular?"));
    }

    @Test
    void callReturnsLlmOutput() {
        AgentToolResult result = registry.call("generate_code",
                Map.of("prompt", "a REST endpoint", "language", "java"));

        assertTrue(result.ok());
        assertEquals("generate_code", result.tool());
        assertEquals("llm-output", result.output());
    }

    @Test
    void callRejectsMissingRequiredParam() {
        AgentToolResult result = registry.call("generate_code", Map.of());

        assertFalse(result.ok());
        assertTrue(result.error().contains("prompt"));
        verifyNoInteractions(chatClient);
    }

    @Test
    void callRejectsUnknownTool() {
        AgentToolResult result = registry.call("nope", Map.of());

        assertFalse(result.ok());
        assertTrue(result.error().contains("unknown tool"));
    }

    @Test
    void callSurfacesLlmFailureAsError() {
        when(chatClient.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("ollama down"));

        AgentToolResult result = registry.call("architecture_advice",
                Map.of("question", "q"));

        assertFalse(result.ok());
        assertTrue(result.error().contains("llm error"));
    }
}
