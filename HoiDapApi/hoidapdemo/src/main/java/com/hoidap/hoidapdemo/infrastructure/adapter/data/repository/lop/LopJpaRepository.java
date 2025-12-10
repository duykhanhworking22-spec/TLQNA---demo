package com.hoidap.hoidapdemo.infrastructure.adapter.data.repository.lop;

import com.hoidap.hoidapdemo.infrastructure.adapter.data.entity.lop.LopJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LopJpaRepository extends JpaRepository<LopJpaEntity, String> {
    @Query("SELECT DISTINCT l.khoaHoc FROM LopJpaEntity l WHERE l.khoaHoc IS NOT NULL")
    List<String> findDistinctKhoaHoc();

    @Query("SELECT DISTINCT l.chuyenNganh FROM LopJpaEntity l WHERE l.chuyenNganh IS NOT NULL")
    List<String> findDistinctChuyenNganh();

    @Query("SELECT DISTINCT l.maLop FROM LopJpaEntity l")
    List<String> findAllMaLop();
}
