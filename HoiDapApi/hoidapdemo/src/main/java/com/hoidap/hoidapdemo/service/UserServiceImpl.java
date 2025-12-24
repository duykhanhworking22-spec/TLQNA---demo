package com.hoidap.hoidapdemo.service;

import com.hoidap.hoidapdemo.entity.enums.UserRole;
import com.hoidap.hoidapdemo.entity.admin.AdminJpaEntity;
import com.hoidap.hoidapdemo.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.entity.lop.LopJpaEntity;
import com.hoidap.hoidapdemo.entity.sinhvien.SinhVienJpaEntity;
import com.hoidap.hoidapdemo.repository.admin.AdminJpaRepository;
import com.hoidap.hoidapdemo.repository.cvht.CVHTJpaRepository;
import com.hoidap.hoidapdemo.repository.lop.LopJpaRepository;
import com.hoidap.hoidapdemo.repository.sinhvien.SinhVienJpaRepository;
import com.hoidap.hoidapdemo.security.JwtUtils;
import com.hoidap.hoidapdemo.dto.user.ProfileUpdateRequest;
import com.hoidap.hoidapdemo.dto.user.UserDto;
import com.hoidap.hoidapdemo.dto.user.UserProfileResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class UserServiceImpl {
    private final SinhVienJpaRepository sinhVienRepo;
    private final CVHTJpaRepository cvhtRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final LopJpaRepository lopRepo;
    private final AdminJpaRepository adminRepo;

    public UserServiceImpl(
            SinhVienJpaRepository sinhVienRepo,
            CVHTJpaRepository cvhtRepo,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            LopJpaRepository lopRepo,
            AdminJpaRepository adminRepo) {
        this.sinhVienRepo = sinhVienRepo;
        this.cvhtRepo = cvhtRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.lopRepo = lopRepo;
        this.adminRepo = adminRepo;
    }

    // 
    // @Transactional
    // public String register(String email, String password, String hoTen, String
    // soDienThoai,UserRole role) {
    // if (sinhVienRepo.findByEmail(email).isPresent() ||
    // cvhtRepo.findByEmail(email).isPresent()) {
    // throw new IllegalArgumentException("Email already exists");
    // }
    //
    // String hashedPassword = passwordEncoder.encode(password);
    // String generatedId;
    //
    // if (role == UserRole.SINH_VIEN) {
    // String maxSvId = sinhVienRepo.findMaxMaSv();
    // generatedId = generateNextId(maxSvId, "a");
    //
    // SinhVienJpaEntity sv = new SinhVienJpaEntity();
    // sv.setMaSv(generatedId);
    // sv.setEmail(email);
    // sv.setPassword(hashedPassword);
    // sv.setHoTen(hoTen);
    // sv.setSoDienThoai(soDienThoai);
    //
    // sinhVienRepo.save(sv);
    // return sv.getMaSv();
    //
    // } else if (role == UserRole.CVHT) {
    // String maxCvId = cvhtRepo.findMaxMaCv();
    // generatedId = generateNextId(maxCvId, "b");
    //
    // CVHTJpaEntity cv = new CVHTJpaEntity();
    // cv.setMaCv(generatedId);
    // cv.setEmail(email);
    // cv.setPassword(hashedPassword);
    // cv.setHoTen(hoTen);
    // cv.setSoDienThoai(soDienThoai);
    // cv.setChuyenMon(null);
    //
    // cvhtRepo.save(cv);
    // return cv.getMaCv();
    // }
    //
    // throw new IllegalArgumentException("Invalid user role specified: " +
    // role.name());
    // }

    
    public String login(String email, String password) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDto userDetails = this.getUserByEmail(email);

        return jwtUtils.generateJwtToken(
                authentication,
                userDetails.getMaDinhDanh(),
                userDetails.getHoTen(),
                userDetails.getRole());
    }

    public UserProfileResponse getMyProfile(String email) {
        var svOpt = sinhVienRepo.findByEmail(email);
        if (svOpt.isPresent()) {
            SinhVienJpaEntity sv = svOpt.get();
            LopJpaEntity lop = sv.getLop();
            String cvhtMa = null;
            String cvhtHoTen = null;

            // Get CVHT info from Lop
            if (lop != null && lop.getCvht() != null) {
                CVHTJpaEntity cvht = lop.getCvht();
                cvhtMa = cvht.getMaCv();
                cvhtHoTen = cvht.getHoTen();
            }

            return UserProfileResponse.builder()
                    .maDinhDanh(sv.getMaSv())
                    .hoTen(sv.getHoTen())
                    .email(sv.getEmail())
                    .soDienThoai(sv.getSoDienThoai())
                    .role("SINH_VIEN")
                    .maLop(lop != null ? lop.getMaLop() : "ChÆ°a cÃ³ lá»›p")
                    .tenLop(lop != null ? "Lá»›p " + lop.getMaLop() : "")
                    .cvhtMa(cvhtMa)
                    .cvhtHoTen(cvhtHoTen)
                    .build();
        }

        var cvhtOpt = cvhtRepo.findByEmail(email);
        if (cvhtOpt.isPresent()) {
            CVHTJpaEntity cv = cvhtOpt.get();
            return UserProfileResponse.builder()
                    .maDinhDanh(cv.getMaCv())
                    .hoTen(cv.getHoTen())
                    .email(cv.getEmail())
                    .soDienThoai(cv.getSoDienThoai())
                    .role("CVHT")
                    .build();
        }
        throw new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng: " + email);
    }

    
    public UserDto getUserByEmail(String email) {
        var svOpt = sinhVienRepo.findByEmail(email);
        if (svOpt.isPresent()) {
            SinhVienJpaEntity sv = svOpt.get();
            return UserDto.builder()
                    .maDinhDanh(sv.getMaSv())
                    .hoTen(sv.getHoTen())
                    .email(sv.getEmail())
                    .role(UserRole.SINH_VIEN.name())
                    .build();
        }

        var cvhtOpt = cvhtRepo.findByEmail(email);
        if (cvhtOpt.isPresent()) {
            CVHTJpaEntity cv = cvhtOpt.get();
            return UserDto.builder()
                    .maDinhDanh(cv.getMaCv())
                    .hoTen(cv.getHoTen())
                    .email(cv.getEmail())
                    .role(UserRole.CVHT.name())
                    .build();
        }

        var adminOpt = adminRepo.findByEmail(email);
        if (adminOpt.isPresent()) {
            AdminJpaEntity admin = adminOpt.get();
            return UserDto.builder()
                    .maDinhDanh(admin.getEmail())
                    .hoTen(admin.getHoTen())
                    .email(null)
                    .role(UserRole.ADMIN.name())
                    .build();
        }

        throw new IllegalArgumentException("User not found with identifier: " + email);
    }

    
    @Transactional
    public void updateProfile(String email, ProfileUpdateRequest request) {
        var svOpt = sinhVienRepo.findByEmail(email);
        if (svOpt.isPresent()) {
            SinhVienJpaEntity sv = svOpt.get();

            if (request.getHoTen() != null)
                sv.setHoTen(request.getHoTen());
            if (request.getSoDienThoai() != null)
                sv.setSoDienThoai(request.getSoDienThoai());

            if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                sv.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }

            if (request.getMaLop() != null) {
                LopJpaEntity lop = lopRepo
                        .findById(Objects.requireNonNull(request.getMaLop(), "MÃ£ lá»›p khÃ´ng Ä‘Æ°á»£c null"))
                        .orElseThrow(() -> new IllegalArgumentException(
                                "MÃ£ lá»›p khÃ´ng tá»“n táº¡i: " + request.getMaLop()));
                sv.setLop(lop);
            }

            sinhVienRepo.save(Objects.requireNonNull(sv, "Sinh viÃªn khÃ´ng Ä‘Æ°á»£c null"));
            return;
        }

        var cvhtOpt = cvhtRepo.findByEmail(email);
        if (cvhtOpt.isPresent()) {
            CVHTJpaEntity cv = cvhtOpt.get();

            if (request.getHoTen() != null)
                cv.setHoTen(request.getHoTen());
            if (request.getSoDienThoai() != null)
                cv.setSoDienThoai(request.getSoDienThoai());

            if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                cv.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }

            if (request.getChuyenMon() != null) {
                cv.setChuyenMon(request.getChuyenMon());
            }

            cvhtRepo.save(Objects.requireNonNull(cv, "CVHT khÃ´ng Ä‘Æ°á»£c null"));
            return;
        }

        throw new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y user vá»›i email: " + email);
    }

    
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Máº­t kháº©u má»›i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng");
        }

        // Check SinhVien
        var svOpt = sinhVienRepo.findByEmail(email);
        if (svOpt.isPresent()) {
            SinhVienJpaEntity sv = svOpt.get();
            if (!passwordEncoder.matches(currentPassword, sv.getPassword())) {
                throw new IllegalArgumentException("Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng");
            }
            sv.setPassword(passwordEncoder.encode(newPassword));
            sinhVienRepo.save(sv);
            return;
        }

        // Check CVHT
        var cvhtOpt = cvhtRepo.findByEmail(email);
        if (cvhtOpt.isPresent()) {
            CVHTJpaEntity cv = cvhtOpt.get();
            if (!passwordEncoder.matches(currentPassword, cv.getPassword())) {
                throw new IllegalArgumentException("Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng");
            }
            cv.setPassword(passwordEncoder.encode(newPassword));
            cvhtRepo.save(cv);
            return;
        }

        throw new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng vá»›i email: " + email);
    }

    // Admin SinhVien
    
    public List<SinhVienJpaEntity> getAllSinhVien() {
        return sinhVienRepo.findAll();
    }

    
    public SinhVienJpaEntity getSinhVienById(String id) {
        return sinhVienRepo.findById(Objects.requireNonNull(id, "ID sinh viÃªn khÃ´ng Ä‘Æ°á»£c null"))
                .orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y SV: " + id));
    }

    
    @Transactional
    public void saveSinhVien(SinhVienJpaEntity sv) {
        if (sinhVienRepo.existsById(Objects.requireNonNull(sv.getMaSv(), "MÃ£ sinh viÃªn khÃ´ng Ä‘Æ°á»£c null"))) {
            SinhVienJpaEntity oldSV = getSinhVienById(sv.getMaSv());
            if (sv.getPassword() == null || sv.getPassword().isEmpty()) {
                sv.setPassword(oldSV.getPassword());
            } else {
                sv.setPassword(passwordEncoder.encode(sv.getPassword()));
            }
        } else {
            sv.setPassword(passwordEncoder.encode(sv.getPassword()));
        }
        sinhVienRepo.save(sv);
    }

    
    @Transactional
    public void deleteSinhVien(String id) {
        sinhVienRepo.deleteById(Objects.requireNonNull(id, "ID sinh viÃªn khÃ´ng Ä‘Æ°á»£c null"));
    }

    // Admin Cvht
    
    public List<CVHTJpaEntity> getAllCVHT() {
        return cvhtRepo.findAll();
    }

    
    public CVHTJpaEntity getCVHTById(String id) {
        return cvhtRepo.findById(Objects.requireNonNull(id, "ID CVHT khÃ´ng Ä‘Æ°á»£c null"))
                .orElseThrow(() -> new IllegalArgumentException("Not found"));
    }

    
    @Transactional
    public void saveCVHT(CVHTJpaEntity cv) {
        if (cvhtRepo.existsById(Objects.requireNonNull(cv.getMaCv(), "MÃ£ CVHT khÃ´ng Ä‘Æ°á»£c null"))) {
            CVHTJpaEntity oldCV = getCVHTById(cv.getMaCv());
            if (cv.getPassword() == null || cv.getPassword().isEmpty()) {
                cv.setPassword(oldCV.getPassword());
            } else {
                cv.setPassword(passwordEncoder.encode(cv.getPassword()));
            }
        } else {
            cv.setPassword(passwordEncoder.encode(cv.getPassword()));
        }
        cvhtRepo.save(cv);
    }

    
    @Transactional
    public void deleteCVHT(String id) {
        cvhtRepo.deleteById(Objects.requireNonNull(id, "ID CVHT khÃ´ng Ä‘Æ°á»£c null"));
    }
}

