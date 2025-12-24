package com.hoidap.hoidapdemo.service;

import com.hoidap.hoidapdemo.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.entity.lop.LopJpaEntity;
import com.hoidap.hoidapdemo.repository.cvht.CVHTJpaRepository;
import com.hoidap.hoidapdemo.repository.lop.LopJpaRepository;
import com.hoidap.hoidapdemo.dto.lop.CreateLopRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class LopServiceImpl {
    private final LopJpaRepository lopRepo;
    private final CVHTJpaRepository cvhtRepo;

    public LopServiceImpl(LopJpaRepository lopRepo, CVHTJpaRepository cvhtRepo) {
        this.lopRepo = lopRepo;
        this.cvhtRepo = cvhtRepo;
    }

    
    @Transactional
    public void createLop(CreateLopRequest request) {
        if (lopRepo.existsById(Objects.requireNonNull(request.getMaLop(), "MÃ£ lá»›p khÃ´ng Ä‘Æ°á»£c null"))) {
            throw new IllegalArgumentException("MÃ£ lá»›p Ä‘Ã£ tá»“n táº¡i: " + request.getMaLop());
        }

        LopJpaEntity lop = new LopJpaEntity();
        lop.setMaLop(request.getMaLop());
        lop.setKhoaHoc(request.getKhoaHoc());
        lop.setChuyenNganh(request.getChuyenNganh());

        if (request.getMaCvht() != null && !request.getMaCvht().isEmpty()) {
            CVHTJpaEntity cvht = cvhtRepo.findById(Objects.requireNonNull(request.getMaCvht()))
                    .orElseThrow(() -> new IllegalArgumentException("MÃ£ CVHT khÃ´ng tá»“n táº¡i"));
            lop.setCvht(cvht);
        }

        lopRepo.save(lop);
    }

    
    public List<LopJpaEntity> getAllLop() {
        return lopRepo.findAll();
    }

    
    public LopJpaEntity getLopById(String id) {
        return lopRepo.findById(Objects.requireNonNull(id, "ID khÃ´ng Ä‘Æ°á»£c null"))
                .orElseThrow(() -> new IllegalArgumentException("Lá»›p khÃ´ng tá»“n táº¡i vá»›i mÃ£: " + id));
    }

    
    @Transactional
    public void updateLop(String id, CreateLopRequest request) {
        LopJpaEntity lop = getLopById(id);
        lop.setKhoaHoc(request.getKhoaHoc());
        lop.setChuyenNganh(request.getChuyenNganh());

        if (request.getMaCvht() != null && !request.getMaCvht().isEmpty()) {
            CVHTJpaEntity cvht = cvhtRepo.findById(Objects.requireNonNull(request.getMaCvht()))
                    .orElseThrow(() -> new IllegalArgumentException("MÃ£ CVHT khÃ´ng tá»“n táº¡i"));
            lop.setCvht(cvht);
        } else {
            lop.setCvht(null);
        }

        lopRepo.save(lop);
    }

    
    @Transactional
    public void deleteLop(String id) {
        String nonNullId = Objects.requireNonNull(id, "ID khÃ´ng Ä‘Æ°á»£c null");
        if (!lopRepo.existsById(nonNullId)) {
            throw new IllegalArgumentException("KhÃ´ng thá»ƒ xÃ³a. Lá»›p khÃ´ng tá»“n táº¡i: " + nonNullId);
        }
        lopRepo.deleteById(nonNullId);
    }

    
    @Transactional
    public void saveListLop(List<LopJpaEntity> listLop) {
        lopRepo.saveAll(Objects.requireNonNull(listLop, "Danh sÃ¡ch lá»›p khÃ´ng Ä‘Æ°á»£c null"));
    }

    
    public List<String> getAllMaLop() {
        return lopRepo.findAllMaLop();
    }

    
    public List<String> getAllKhoaHoc() {
        return lopRepo.findDistinctKhoaHoc();
    }

    
    public List<String> getAllChuyenNganh() {
        return lopRepo.findDistinctChuyenNganh();
    }
}

