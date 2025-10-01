package com.servexa.auth;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnectionTest {
    
    @Test
    public void testPostgreSQLConnection() {
        String url = "jdbc:postgresql://localhost:5432/servexa_auth";
        String username = "postgres";
        String password = "password";
        
        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            System.out.println("Successfully connected to PostgreSQL!");
            System.out.println("Database: " + conn.getCatalog());
        } catch (SQLException e) {
            System.err.println("Failed to connect to PostgreSQL:");
            System.err.println("Error: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            e.printStackTrace();
        }
    }
}