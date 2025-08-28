package com.Backend.features.authentication.filter;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.service.AuthService;
import com.Backend.features.authentication.utils.JsonWebToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class AuthFilter extends HttpFilter {

    private final List<String> unsecuredEndpoints = Arrays.asList(
            "/api/v1/authentication/login",
            "/api/v1/authentication/register",
            "/api/v1/authentication/send-password-reset-token",
            "/api/v1/authentication/reset-password"
    );

    private final JsonWebToken jsonWebToken;
    private final AuthService authService;

    public AuthFilter(JsonWebToken jsonWebToken, AuthService authService) {
        this.jsonWebToken = jsonWebToken;
        this.authService = authService;
    }

    @Override
    protected void doFilter(HttpServletRequest request , HttpServletResponse response , FilterChain chain) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin","http://localhost:5173");
        response.addHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
        response.addHeader("Access-Control-Allow-Headers","Content-Type,Authorization");

        if("Options".equalsIgnoreCase(request.getMethod())){
           response.setStatus(HttpServletResponse.SC_OK);
           return;
        }

        String path = request.getRequestURI();

        if(unsecuredEndpoints.contains(path) || path.startsWith("/api/v1/authentication/oauth") || path.startsWith("/api/v1/storage")){
           chain.doFilter(request,response);
           return;
        }
        try{
            String authorization = request.getHeader("Authorization");

            if(authorization ==null || !authorization.startsWith("Bearer ")){
                throw new ServletException("Token missing");
            }

            String token = authorization.substring(7);

            if(jsonWebToken.isTokenExpired(token)){
                throw new ServletException("Token Expired");
            }

            String email = jsonWebToken.getEmailFromToken(token);
            User user = authService.getUser(email);
            request.setAttribute("authenticatedUser",user);
            chain.doFilter(request,response);
        }catch (Exception e) {
            // ❌ Any error = block the request with 401 Unauthorized
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Invalid authentication token, or token missing.\"}");
        }
    }
}
