package com.hoidap.hoidapdemo.service;

import com.hoidap.hoidapdemo.entity.enums.QuestionStatus;
import com.hoidap.hoidapdemo.entity.answer.AnswerJpaEntity;
import com.hoidap.hoidapdemo.entity.answer.AnswerVersionJpaEntity;
import com.hoidap.hoidapdemo.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.entity.question.QuestionJpaEntity;
import com.hoidap.hoidapdemo.entity.sinhvien.SinhVienJpaEntity;
import com.hoidap.hoidapdemo.repository.answer.AnswerJpaRepository;
import com.hoidap.hoidapdemo.repository.answer.AnswerVersionJpaRepository;
import com.hoidap.hoidapdemo.repository.question.QuestionJpaRepository;
import com.hoidap.hoidapdemo.repository.sinhvien.SinhVienJpaRepository;
import com.hoidap.hoidapdemo.repository.specification.QuestionSpecification;
import com.hoidap.hoidapdemo.dto.answer.AnswerRequest;
import com.hoidap.hoidapdemo.dto.answer.LatestAnswerResponse;
import com.hoidap.hoidapdemo.dto.common.PageResponse;
import com.hoidap.hoidapdemo.dto.question.QuestionFilter;
import com.hoidap.hoidapdemo.dto.question.QuestionRequest;
import com.hoidap.hoidapdemo.dto.question.QuestionResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl {
    private final QuestionJpaRepository questionRepo;
    private final SinhVienJpaRepository sinhVienRepo;
    private final AnswerJpaRepository answerRepo;
    private final AnswerVersionJpaRepository answerVersionRepo;

    public QuestionServiceImpl(QuestionJpaRepository questionRepo, SinhVienJpaRepository sinhVienRepo,
            AnswerJpaRepository answerRepo, AnswerVersionJpaRepository answerVersionRepo) {
        this.questionRepo = questionRepo;
        this.sinhVienRepo = sinhVienRepo;
        this.answerRepo = answerRepo;
        this.answerVersionRepo = answerVersionRepo;
    }

    @Transactional
    public void createQuestion(String maSv, QuestionRequest request) {
        SinhVienJpaEntity sv = sinhVienRepo.findById(Objects.requireNonNull(maSv, "Mã sinh viên không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Sinh viên không tồn tại với mã: " + maSv));

        if (sv.getLop() == null || sv.getLop().getCvht() == null) {
            throw new IllegalArgumentException("Sinh viên chưa có lớp hoặc lớp chưa có CVHT");
        }
        CVHTJpaEntity cvht = sv.getLop().getCvht();

        // 2024-12-24: Check daily limit (MAX 3 questions/day)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59);

        long countToday = questionRepo.countBySinhVien_MaSvAndNgayGuiBetween(maSv, startOfDay, endOfDay);
        if (countToday >= 3) {
            throw new IllegalStateException("Bạn đã đạt tới giới hạn 3 câu hỏi / ngày, vui lòng quay lại vào ngày mai");
        }

        QuestionJpaEntity question = new QuestionJpaEntity();
        question.setTieuDe(request.getTieuDe());
        question.setNoiDung(request.getNoiDung());
        question.setLinhVuc(request.getLinhVuc());
        question.setNgayGui(LocalDateTime.now());
        question.setTrangThai(QuestionStatus.PENDING);
        question.setSinhVien(sv);
        question.setCvht(cvht);

        try {
            if (request.getFile() != null && !request.getFile().isEmpty()) {
                question.setFileName(request.getFile().getOriginalFilename());
                question.setFileType(request.getFile().getContentType());
                question.setFileData(request.getFile().getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi đọc file", e);
        }

        questionRepo.save(question);
    }

    @Transactional
    public PageResponse<QuestionResponse> getAllQuestions(QuestionFilter filter, int pageNo, int pageSize) {
        Specification<QuestionJpaEntity> spec = QuestionSpecification.filter(filter);
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("ngayGui").descending());

        Page<QuestionJpaEntity> questionsPage = questionRepo.findAll(spec, pageable);

        List<QuestionResponse> content = questionsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<QuestionResponse>builder()
                .content(content)
                .pageNo(questionsPage.getNumber())
                .pageSize(questionsPage.getSize())
                .totalElements(questionsPage.getTotalElements())
                .totalPages(questionsPage.getTotalPages())
                .last(questionsPage.isLast())
                .build();
    }

    @Transactional
    public QuestionResponse getQuestionById(Long id) {
        QuestionJpaEntity q = questionRepo.findById(Objects.requireNonNull(id, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi ID: " + id));
        return mapToResponse(q);
    }

    public QuestionJpaEntity getQuestionEntityById(Long id) {
        return questionRepo.findById(Objects.requireNonNull(id, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi ID: " + id));
    }

    @Transactional
    public void updateQuestion(Long questionId, String maSv, QuestionRequest request) {
        QuestionJpaEntity question = questionRepo
                .findById(Objects.requireNonNull(questionId, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi ID:" + questionId));
        if (!question.getSinhVien().getMaSv().equals(maSv)) {
            throw new SecurityException("Bạn không có quyền chỉnh sửa câu hỏi này!");
        }

        question.setTieuDe(request.getTieuDe());
        question.setNoiDung(request.getNoiDung());
        question.setLinhVuc(request.getLinhVuc());
        question.setNgayCapNhatCuoi(LocalDateTime.now());

        try {
            if (request.getFile() != null && !request.getFile().isEmpty()) {
                question.setFileName(request.getFile().getOriginalFilename());
                question.setFileType(request.getFile().getContentType());
                question.setFileData(request.getFile().getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi cập nhật file", e);
        }

        questionRepo.save(question);
    }

    @Transactional
    public void answerQuestion(Long questionId, String emailCvht, AnswerRequest request) {
        QuestionJpaEntity q = questionRepo.findById(Objects.requireNonNull(questionId, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi"));
        if (q.getCvht() == null || !q.getCvht().getEmail().equals(emailCvht)) {
            throw new SecurityException("Bạn không có quyền truy cập!");
        }

        if (q.getTrangThai() == QuestionStatus.REPORTED) {
            throw new IllegalStateException("Câu hỏi đã bị báo cáo vi phạm và không thể trả lời.");
        }

        AnswerJpaEntity answer = answerRepo.findByQuestion_MaCauHoi(questionId)
                .orElse(null);

        if (answer == null) {
            answer = new AnswerJpaEntity();
            answer.setQuestion(q);
            answer.setCvht(q.getCvht());
            answer.setCurrentVersion(0);
        }

        AnswerVersionJpaEntity version = new AnswerVersionJpaEntity();
        version.setAnswer(answer);
        version.setNoiDung(request.getNoiDung());
        version.setThoiGianTao(LocalDateTime.now());

        int newVersion = answer.getCurrentVersion() + 1;
        version.setVersion(newVersion);

        answer.setCurrentVersion(newVersion);

        try {
            if (request.getFile() != null && !request.getFile().isEmpty()) {
                version.setFileName(request.getFile().getOriginalFilename());
                version.setFileType(request.getFile().getContentType());
                version.setFileData(request.getFile().getBytes()); // Lưu nhị phân
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi đọc file trả lời", e);
        }

        answerVersionRepo.save(version);
        answerRepo.save(answer);

        q.setTrangThai(QuestionStatus.ANSWER);
        questionRepo.save(q);
    }

    @Transactional
    public void reportQuestion(Long id, String reason) {
        QuestionJpaEntity q = questionRepo.findById(Objects.requireNonNull(id, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi"));

        q.setTrangThai(QuestionStatus.REPORTED);
        q.setLyDoBaoCao(reason);
        questionRepo.save(q);
    }

    private QuestionResponse mapToResponse(QuestionJpaEntity q) {
        String downloadUri = null;
        if (q.getFileData() != null) {
            downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/questions/")
                    .path(Objects.requireNonNull(
                            Objects.requireNonNull(q.getMaCauHoi(), "ID câu hỏi không được null").toString()))
                    .path("/file")
                    .toUriString();
        }

        return QuestionResponse.builder()
                .maCauHoi(q.getMaCauHoi())
                .tieuDe(q.getTieuDe())
                .noiDung(q.getNoiDung())
                .linhVuc(q.getLinhVuc())
                .trangThai(q.getTrangThai().toString())
                .ngayGui(q.getNgayGui())
                .ngayCapNhatCuoi(q.getNgayCapNhatCuoi())
                .maSinhVien(q.getSinhVien().getMaSv())
                .tenSinhVien(q.getSinhVien().getHoTen())
                .maCvht(q.getCvht() != null ? q.getCvht().getMaCv() : null)
                .tenCvht(q.getCvht() != null ? q.getCvht().getHoTen() : null)
                .maLop(q.getSinhVien().getLop() != null ? q.getSinhVien().getLop().getMaLop() : null)
                .khoaHoc(q.getSinhVien().getLop() != null ? q.getSinhVien().getLop().getKhoaHoc() : null)
                .chuyenNganh(q.getSinhVien().getLop() != null ? q.getSinhVien().getLop().getChuyenNganh() : null)
                .fileName(q.getFileName())
                .fileDownloadUri(downloadUri)
                .lyDoBaoCao(q.getLyDoBaoCao())
                .build();
    }

    public LatestAnswerResponse getLatestAnswer(Long questionId) {
        AnswerJpaEntity answer = answerRepo.findByQuestion_MaCauHoi(questionId)
                .orElse(null);
        if (answer == null) {
            return null;
        }

        AnswerVersionJpaEntity latestVersion = answerVersionRepo
                .findFirstByAnswer_IdOrderByVersionDesc(answer.getId())
                .orElse(null);

        if (latestVersion == null)
            return null;

        String downloadUrl = null;
        if (latestVersion.getFileData() != null) {
            downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/questions/versions/")
                    .path(Objects.requireNonNull(
                            Objects.requireNonNull(latestVersion.getId(), "ID phiên bản không được null").toString()))
                    .path("/file")
                    .toUriString();
        }

        return LatestAnswerResponse.builder()
                .noiDung(latestVersion.getNoiDung())
                .tenCvht(answer.getCvht().getHoTen())
                .ngayTraLoi(latestVersion.getThoiGianTao())
                .fileName(latestVersion.getFileName())
                .fileDownloadUrl(downloadUrl)
                .build();
    }

    // admin
    @Transactional
    public void adminUpdateQuestion(Long id, QuestionRequest request) {
        QuestionJpaEntity q = questionRepo.findById(Objects.requireNonNull(id, "ID câu hỏi không được null"))
                .orElseThrow(() -> new IllegalArgumentException("Câu hỏi không tồn tại"));

        q.setTieuDe(request.getTieuDe());
        q.setNoiDung(request.getNoiDung());
        q.setLinhVuc(request.getLinhVuc());
        questionRepo.save(q);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        AnswerJpaEntity answer = answerRepo.findByQuestion_MaCauHoi(id).orElse(null);
        if (answer != null) {
            answerRepo.delete(answer);
        }
        questionRepo.deleteById(Objects.requireNonNull(id, "ID cÃ¢u há»i khÃ´ng Ä‘Æ°á»£c null"));
    }

    public Map<String, Object> getQuestionDetailForAdmin(Long id) {
        QuestionJpaEntity q = getQuestionEntityById(id);
        AnswerJpaEntity answer = answerRepo.findByQuestion_MaCauHoi(id).orElse(null);

        List<AnswerVersionJpaEntity> history = (answer != null)
                ? answerVersionRepo.findByAnswer_IdOrderByVersionDesc(answer.getId())
                : List.of();

        Map<String, Object> result = new HashMap<>();
        // Convert Entity to DTO to match view expectations (tenSinhVien, maSinhVien,
        // etc.)
        result.put("question", mapToResponse(q));

        // Flatten Answer object for the view if it exists
        if (answer != null && !history.isEmpty()) {
            AnswerVersionJpaEntity latest = history.get(0);
            Map<String, Object> answerDTO = new HashMap<>();
            if (answer.getCvht() != null) {
                answerDTO.put("maCvht", answer.getCvht().getMaCv());
                answerDTO.put("tenCvht", answer.getCvht().getHoTen());
            }
            answerDTO.put("noiDung", latest.getNoiDung());
            answerDTO.put("ngayTraLoi", latest.getThoiGianTao());

            result.put("answer", answerDTO);
        } else {
            result.put("answer", null);
        }

        result.put("history", history);

        return result;
    }
}
