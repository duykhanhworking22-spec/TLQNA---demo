package com.hoidap.hoidapdemo.application.service;

import com.hoidap.hoidapdemo.application.port.LopServicePort;
import com.hoidap.hoidapdemo.infrastructure.adapter.data.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.infrastructure.adapter.data.entity.lop.LopJpaEntity;
import com.hoidap.hoidapdemo.infrastructure.adapter.data.repository.cvht.CVHTJpaRepository;
import com.hoidap.hoidapdemo.infrastructure.adapter.data.repository.lop.LopJpaRepository;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.lop.CreateLopRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class LopServiceImpl implements LopServicePort {
    private final LopJpaRepository lopRepo;
    private final CVHTJpaRepository cvhtRepo;

    public LopServiceImpl(LopJpaRepository lopRepo, CVHTJpaRepository cvhtRepo) {
        this.lopRepo = lopRepo;
        this.cvhtRepo = cvhtRepo;
    }

    @Override
    @Transactional
    public void createLop(CreateLopRequest request) {
        if (lopRepo.existsById(Objects.requireNonNull(request.getMaLop(), "Mã lớp không được null"))) {
            throw new IllegalArgumentException("Mã lớp đã tồn tại: " + request.getMaLop());
        }

        LopJpaEntity lop = new LopJpaEntity();
        lop.setMaLop(request.getMaLop());
        lop.setKhoaHoc(request.getKhoaHoc());
        lop.setChuyenNganh(request.getChuyenNganh());

        if (request.getMaCvht() != null && !request.getMaCvht().isEmpty()) {
            CVHTJpaEntity cvht = cvhtRepo.findById(Objects.requireNonNull(request.getMaCvht()))
                    .orElseThrow(() -> new IllegalArgumentException("Mã CVHT không tồn tại"));
            lop.setCvht(cvht);
        }

        lopRepo.save(lop);
    }

    @Override
    public List<LopJpaEntity> getAllLop() {
        return lopRepo.findAll();
    }

    @Override
    public LopJpaEntity getLopById(String id) {
        return lopRepo.findById(Objects.requireNonNull(id, "ID không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Lớp không tồn tại với mã: " + id));
    }

    @Override
    @Transactional
    public void updateLop(String id, CreateLopRequest request) {
        LopJpaEntity lop = getLopById(id);
        lop.setKhoaHoc(request.getKhoaHoc());
        lop.setChuyenNganh(request.getChuyenNganh());

        if (request.getMaCvht() != null && !request.getMaCvht().isEmpty()) {
            CVHTJpaEntity cvht = cvhtRepo.findById(Objects.requireNonNull(request.getMaCvht()))
                    .orElseThrow(() -> new IllegalArgumentException("Mã CVHT không tồn tại"));
            lop.setCvht(cvht);
        } else {
            lop.setCvht(null);
        }

        lopRepo.save(lop);
    }

    @Override
    @Transactional
    public void deleteLop(String id) {
        String nonNullId = Objects.requireNonNull(id, "ID không được null");
        if (!lopRepo.existsById(nonNullId)) {
            throw new IllegalArgumentException("Không thể xóa. Lớp không tồn tại: " + nonNullId);
        }
        lopRepo.deleteById(nonNullId);
    }

    @Override
    @Transactional
    public void saveListLop(List<LopJpaEntity> listLop) {
        lopRepo.saveAll(Objects.requireNonNull(listLop, "Danh sách lớp không được null"));
    }

    @Override
    public List<String> getAllMaLop() {
        return lopRepo.findAllMaLop();
    }

    @Override
    public List<String> getAllKhoaHoc() {
        return lopRepo.findDistinctKhoaHoc();
    }

    @Override
    public List<String> getAllChuyenNganh() {
        return lopRepo.findDistinctChuyenNganh();
    }
}
