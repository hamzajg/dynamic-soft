package com.hamzajg.dynamicsoft.apis;

public class MetadataDto {

    public String name;
    public SettingsDto settings;

    static class SettingsDto {
        public String targetFramework;
        public String targetClientPlatformSettings;
    }
    static class ResponseDto {
        public String code;
        public String link;
    }
}
