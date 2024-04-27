package com.hamzajg.dynamicsoft.apis;

import java.util.List;

public class ProjectDto {
    public String id;
    public String solutionId;
    public String name;
    public String description;
    public List<TagDto> tags;
    public List<TeamDto> teamMembers;

    static class TagDto {
        public String id;
        public String name;
    }
}
