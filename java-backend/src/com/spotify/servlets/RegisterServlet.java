package com.spotify.servlets;

import com.spotify.util.DBConnection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Servlet handling new user registration (Sign Up).
 * Maps to /RegisterServlet or /register.
 */
@WebServlet(name = "RegisterServlet", urlPatterns = {"/RegisterServlet", "/api/register"})
public class RegisterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String fullName = request.getParameter("fullName");
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String preferredLang = request.getParameter("preferredLang");
        if (preferredLang == null || preferredLang.trim().isEmpty()) {
            preferredLang = "All";
        }

        if (username == null || email == null || password == null || fullName == null ||
            username.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\": false, \"message\": \"All fields are required.\"}");
            return;
        }

        // Check if username or email already exists
        String checkSql = "SELECT id FROM users WHERE username = ? OR email = ?";
        String insertSql = "INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection()) {
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, username.trim());
                checkStmt.setString(2, email.trim());
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (rs.next()) {
                        response.setStatus(HttpServletResponse.SC_CONFLICT);
                        out.print("{\"success\": false, \"message\": \"Username or Email already registered in database.\"}");
                        return;
                    }
                }
            }

            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql, PreparedStatement.RETURN_GENERATED_KEYS)) {
                insertStmt.setString(1, fullName.trim());
                insertStmt.setString(2, username.trim());
                insertStmt.setString(3, email.trim());
                insertStmt.setString(4, password.trim());

                int affected = insertStmt.executeUpdate();
                if (affected > 0) {
                    try (ResultSet generatedKeys = insertStmt.getGeneratedKeys()) {
                        int newUserId = generatedKeys.next() ? generatedKeys.getInt(1) : 0;

                        // Create session
                        HttpSession session = request.getSession(true);
                        session.setAttribute("userId", newUserId);
                        session.setAttribute("username", username);
                        session.setAttribute("fullName", fullName);

                        out.print(String.format(
                            "{\"success\": true, \"message\": \"Registration successful! Stored in database.\", \"user\": {\"id\": %d, \"username\": \"%s\", \"email\": \"%s\", \"fullName\": \"%s\"}}",
                            newUserId, username, email, fullName
                        ));
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.print("{\"success\": false, \"message\": \"Failed to create user account.\"}");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Database error: " + e.getMessage() + "\"}");
        }
    }
}
