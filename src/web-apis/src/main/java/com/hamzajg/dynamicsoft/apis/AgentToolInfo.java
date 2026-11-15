package com.hamzajg.dynamicsoft.apis;

import java.util.Map;

public record AgentToolInfo(String name, String description, Map<String, Object> parameters) {
}
