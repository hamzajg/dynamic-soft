package com.hamzajg.dynamicsoft.apis;

public class ArchitecturalProposalDto {
    public String type = "ARCHITECTURAL_PROPOSAL";
    public String proposalId;
    public String action; // ADD_NODE, UPDATE_NODE, CREATE_RELATIONSHIP
    public Object payload;
    public String reasoning;

    public ArchitecturalProposalDto(String proposalId, String action, Object payload, String reasoning) {
        this.proposalId = proposalId;
        this.action = action;
        this.payload = payload;
        this.reasoning = reasoning;
    }
}
