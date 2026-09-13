package net.javaguides.springboot.service;

import net.javaguides.springboot.dto.AuthResponse;
import net.javaguides.springboot.dto.LoginRequest;
import net.javaguides.springboot.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
