package com.hoidap.hoidapdemo.service;

import com.hoidap.hoidapdemo.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.entity.sinhvien.SinhVienJpaEntity;
import com.hoidap.hoidapdemo.repository.cvht.CVHTJpaRepository;
import com.hoidap.hoidapdemo.repository.sinhvien.SinhVienJpaRepository;
import com.hoidap.hoidapdemo.dto.auth.AccountCreatedResponse;
import com.hoidap.hoidapdemo.dto.auth.CreateUserRequest;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminServiceImpl {
    private final SinhVienJpaRepository sinhVienRepo;
    private final CVHTJpaRepository cvhtRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(
            SinhVienJpaRepository sinhVienRepo,
            CVHTJpaRepository cvhtRepo,
            PasswordEncoder passwordEncoder) {
        this.sinhVienRepo = sinhVienRepo;
        this.cvhtRepo = cvhtRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @Transactional
    public AccountCreatedResponse createStudentAccount(CreateUserRequest request) {
        String maSv = request.getMaDinhDanh().trim().toUpperCase();
        String email = request.getEmail().trim().toLowerCase();

        String expectedEmail = maSv.toLowerCase() + "@thanglong.edu.vn";
        if (!email.equals(expectedEmail)) {
            throw new IllegalArgumentException("Email sinh viÃªn pháº£i cÃ³ dáº¡ng: " + expectedEmail);
        }

        if (sinhVienRepo.existsById(maSv)) {
            throw new IllegalArgumentException("MÃ£ sinh viÃªn " + maSv + " Ä‘Ã£ tá»“n táº¡i!");
        }
        if (sinhVienRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email " + email + " Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng!");
        }

        String rawPassword = generateRandomPassword();

        SinhVienJpaEntity sv = new SinhVienJpaEntity();
        sv.setMaSv(maSv);
        sv.setEmail(email);
        sv.setPassword(passwordEncoder.encode(rawPassword));
        sv.setRole("SINH_VIEN");
        sv.setHoTen("ChÆ°a cáº­p nháº­t");

        sinhVienRepo.save(sv);

        return AccountCreatedResponse.builder()
                .email(email)
                .generatedPassword(rawPassword)
                .message("Táº¡o thÃ nh cÃ´ng. MÃ£ SV: " + maSv)
                .build();
    }

    @Transactional
    public AccountCreatedResponse createAdvisorAccount(CreateUserRequest request) {
        String maCv = request.getMaDinhDanh().trim().toUpperCase();
        String email = request.getEmail().trim().toLowerCase();

        String expectedEmail = maCv.toLowerCase() + "@thanglong.edu.vn";
        if (!email.equals(expectedEmail)) {
            throw new IllegalArgumentException("Email CVHT pháº£i cÃ³ dáº¡ng: " + expectedEmail);
        }

        if (cvhtRepo.existsById(maCv)) {
            throw new IllegalArgumentException("MÃ£ CVHT " + maCv + " Ä‘Ã£ tá»“n táº¡i!");
        }
        if (cvhtRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email " + email + " Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng!");
        }

        String rawPassword = generateRandomPassword();

        CVHTJpaEntity cvht = new CVHTJpaEntity();
        cvht.setMaCv(maCv);
        cvht.setEmail(email);
        cvht.setPassword(passwordEncoder.encode(rawPassword));
        cvht.setRole("CVHT");
        cvht.setHoTen("ChÆ°a cáº­p nháº­t");

        cvhtRepo.save(cvht);

        return AccountCreatedResponse.builder()
                .email(email)
                .generatedPassword(rawPassword)
                .message("Táº¡o thÃ nh cÃ´ng. MÃ£ CVHT: " + maCv)
                .build();
    }
}

