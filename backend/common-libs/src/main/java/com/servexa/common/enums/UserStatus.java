package com.servexa.common.enums;

public enum UserStatus {
    PENDING("PENDING"),
    APPROVED("APPROVED"), 
    REJECTED("REJECTED"),
    SUSPENDED("SUSPENDED");

    private final String value;

    UserStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}