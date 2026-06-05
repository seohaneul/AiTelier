package com.craftai.controller;

import com.craftai.entity.AppUser;
import com.craftai.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AppUserRepository userRepository;

    public AuthController(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 아이디입니다"));
        }
        AppUser savedUser = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "message", "회원가입 완료", 
            "role", savedUser.getRole(), 
            "username", savedUser.getUsername(),
            "companyName", savedUser.getCompanyName() != null ? savedUser.getCompanyName() : savedUser.getUsername()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser loginRequest) {
        Optional<AppUser> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginRequest.getPassword())) {
            AppUser foundUser = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "message", "로그인 성공",
                "username", foundUser.getUsername(),
                "role", foundUser.getRole(),
                "companyName", foundUser.getCompanyName() != null ? foundUser.getCompanyName() : foundUser.getUsername()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 틀렸습니다"));
    }
}
