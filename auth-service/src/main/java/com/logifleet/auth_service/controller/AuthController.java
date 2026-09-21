package com.logifleet.auth_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logifleet.auth_service.dto.LoginRequest;
import com.logifleet.auth_service.dto.LoginResponse;
import com.logifleet.auth_service.dto.UserResponse;
import com.logifleet.auth_service.entity.User;
import com.logifleet.auth_service.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Register a new user — returns safe UserResponse (no password hash)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        try {
            User registered = authService.register(user);
            // Return DTO without password hash
            UserResponse response = new UserResponse(
                    registered.getId(),
                    registered.getUsername(),
                    registered.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Login — returns JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        try {
            LoginResponse response = authService.login(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Get user info by username — returns safe UserResponse (no password hash)
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {

        User user = authService.findByUsername(username);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Return DTO without password hash
        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}