package com.hamzajg.dynamicsoft.apis;

import java.util.Map;

public record AgentToolCall(String tool, Map<String, Object> input) {
}
