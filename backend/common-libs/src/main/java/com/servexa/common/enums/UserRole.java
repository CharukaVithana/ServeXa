package com.servexa.common.enums;

public enum UserRole {
    CUSTOMER("CUSTOMER"),
    EMPLOYEE("EMPLOYEE"),
    ADMIN("ADMIN");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}