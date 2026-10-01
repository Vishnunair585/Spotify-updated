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
 * Servlet handling user authentication (Login / Sign In).
 * Maps to /LoginServlet or /login.
 */
@WebServlet(name = "LoginServlet", urlPatterns = {"/LoginServlet", "/api/login"})
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String usernameOrEmail = request.getParameter("usernameOrEmail");
        String password = request.getParameter("password");

        if (usernameOrEmail == null || password == null || usernameOrEmail.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\": false, \"message\": \"Username/Email and Password are required.\"}");
            return;
        }

        String sql = "SELECT id, username, email, full_name FROM users WHERE (username = ? OR email = ?) AND password = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, usernameOrEmail.trim());
            stmt.setString(2, usernameOrEmail.trim());
            stmt.setString(3, password.trim());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    int userId = rs.getInt("id");
                    String username = rs.getString("username");
                    String email = rs.getString("email");
                    String fullName = rs.getString("full_name");

                    // Establish Http Session
                    HttpSession session = request.getSession(true);
                    session.setAttribute("userId", userId);
                    session.setAttribute("username", username);
                    session.setAttribute("fullName", fullName);

                    out.print(String.format(
                        "{\"success\": true, \"message\": \"Login successful! Verified against database.\", \"user\": {\"id\": %d, \"username\": \"%s\", \"email\": \"%s\", \"fullName\": \"%s\"}}",
                        userId, username, email, fullName
                    ));
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.print("{\"success\": false, \"message\": \"Invalid username/email or password.\"}");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Database error: " + e.getMessage() + "\"}");
        }
    }
}
