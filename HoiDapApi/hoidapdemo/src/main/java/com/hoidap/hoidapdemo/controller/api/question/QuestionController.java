package com.hoidap.hoidapdemo.controller.api.question;

import com.hoidap.hoidapdemo.service.UserServiceImpl;
import com.hoidap.hoidapdemo.service.QuestionServiceImpl;
import com.hoidap.hoidapdemo.entity.answer.AnswerVersionJpaEntity;
import com.hoidap.hoidapdemo.entity.cvht.CVHTJpaEntity;
import com.hoidap.hoidapdemo.entity.question.QuestionJpaEntity;
import com.hoidap.hoidapdemo.entity.sinhvien.SinhVienJpaEntity;
import com.hoidap.hoidapdemo.repository.answer.AnswerJpaRepository;
import com.hoidap.hoidapdemo.repository.answer.AnswerVersionJpaRepository;
import com.hoidap.hoidapdemo.repository.cvht.CVHTJpaRepository;
import com.hoidap.hoidapdemo.repository.sinhvien.SinhVienJpaRepository;
import com.hoidap.hoidapdemo.utils.AppStatus;
import com.hoidap.hoidapdemo.dto.answer.AnswerHistoryResponse;
import com.hoidap.hoidapdemo.dto.answer.AnswerRequest;
import com.hoidap.hoidapdemo.dto.answer.LatestAnswerResponse;
import com.hoidap.hoidapdemo.dto.common.ApiResponse;
import com.hoidap.hoidapdemo.dto.common.PageResponse;
import com.hoidap.hoidapdemo.dto.question.QuestionFilter;
import com.hoidap.hoidapdemo.dto.user.UserDto;
import com.hoidap.hoidapdemo.dto.question.QuestionRequest;
import com.hoidap.hoidapdemo.dto.question.QuestionResponse;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Quản Lý Câu Hỏi", description = "Các API liên quan đến hỏi đáp giữa Sinh viên và CVHT")
public class QuestionController {
        private final QuestionServiceImpl questionService;
        private final UserServiceImpl userService;
        private final AnswerJpaRepository answerRepo;
        private final AnswerVersionJpaRepository answerVersionRepo;
        private final SinhVienJpaRepository sinhVienRepo;
        private final CVHTJpaRepository cvhtRepo;

        public QuestionController(
                        QuestionServiceImpl questionService, UserServiceImpl userService,
                        AnswerJpaRepository answerRepo, AnswerVersionJpaRepository answerVersionRepo,
                        SinhVienJpaRepository sinhVienRepo, CVHTJpaRepository cvhtRepo) {
                this.questionService = questionService;
                this.userService = userService;
                this.answerRepo = answerRepo;
                this.answerVersionRepo = answerVersionRepo;
                this.sinhVienRepo = sinhVienRepo;
                this.cvhtRepo = cvhtRepo;
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Sinh viÃªn Ä‘áº·t cÃ¢u há»i má»›i", description = "API nÃ y cho phÃ©p sinh viÃªn gá»­i cÃ¢u há»i kÃ¨m file Ä‘Ã­nh kÃ¨m.")
        public ResponseEntity<?> createQuestion(
                        @ModelAttribute @Valid QuestionRequest request,
                        Authentication authentication) {

                String email = authentication.getName();
                UserDto userDto = userService.getUserByEmail(email);
                questionService.createQuestion(userDto.getMaDinhDanh(), request);
                ApiResponse<Void> response = ApiResponse.<Void>builder()
                                .status(AppStatus.SUCCESS.getCode())
                                .message("Äáº·t cÃ¢u há»i thÃ nh cÃ´ng!")
                                .build();
                return ResponseEntity.ok(response);
        }

        @GetMapping
        @Operation(summary = "Láº¥y danh sÃ¡ch cÃ¢u há»i (CÃ³ phÃ¢n trang)", description = "Há»— trá»£ lá»c theo tá»« khÃ³a, tráº¡ng thÃ¡i, ngÃ y thÃ¡ng...")
        public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> getAllQuestions(
                        @ModelAttribute QuestionFilter filter,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        Authentication authentication) {
                String email = authentication.getName();
                String role = authentication.getAuthorities().iterator().next().getAuthority();

                if (role.contains("SINH_VIEN")) {
                        // Only force filtering by Student ID if NOT in public mode
                        if (!Boolean.TRUE.equals(filter.getIsPublic())) {
                                SinhVienJpaEntity sv = sinhVienRepo.findByEmail(email)
                                                .orElseThrow(() -> new IllegalArgumentException(
                                                                "Không tìm thấy sinh viên!"));

                                filter.setMaSv(sv.getMaSv());
                        }
                } else if (role.contains("CVHT")) {
                        CVHTJpaEntity cv = cvhtRepo.findByEmail(email)
                                        .orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y CVHT!"));

                        filter.setMaCv(cv.getMaCv());
                }

                PageResponse<QuestionResponse> pageData = questionService.getAllQuestions(filter, page, size);

                ApiResponse<PageResponse<QuestionResponse>> response = ApiResponse
                                .<PageResponse<QuestionResponse>>builder()
                                .status(AppStatus.SUCCESS.getCode())
                                .message("Láº¥y danh sÃ¡ch thÃ nh cÃ´ng")
                                .data(pageData)
                                .build();

                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Xem chi tiáº¿t cÃ¢u há»i", description = "Láº¥y thÃ´ng tin chi tiáº¿t dá»±a trÃªn ID cÃ¢u há»i")
        public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
                return ResponseEntity.ok(questionService.getQuestionById(id));
        }

        @GetMapping("/{id}/file")
        public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
                QuestionJpaEntity q = questionService.getQuestionEntityById(id);

                if (q.getFileData() == null) {
                        return ResponseEntity.notFound().build();
                }

                return ResponseEntity.ok()
                                .contentType(
                                                MediaType.parseMediaType(Objects.requireNonNull(q.getFileType(),
                                                                "File type khÃ´ng Ä‘Æ°á»£c null")))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + q.getFileName() + "\"")
                                .body(new ByteArrayResource(
                                                Objects.requireNonNull(q.getFileData(),
                                                                "File data khÃ´ng Ä‘Æ°á»£c null")));
        }

        @GetMapping("/versions/{versionId}/file")
        public ResponseEntity<Resource> downloadAnswerVersionFile(@PathVariable Long versionId) {
                AnswerVersionJpaEntity version = answerVersionRepo
                                .findById(Objects.requireNonNull(versionId, "ID phiÃªn báº£n khÃ´ng Ä‘Æ°á»£c null"))
                                .orElseThrow(
                                                () -> new IllegalArgumentException(
                                                                "PhiÃªn báº£n tráº£ lá»i khÃ´ng tá»“n táº¡i vá»›i ID: "
                                                                                + versionId));
                if (version.getFileData() == null || version.getFileData().length == 0) {
                        return ResponseEntity.notFound().build();
                }
                return ResponseEntity.ok()
                                .contentType(MediaType
                                                .parseMediaType(Objects.requireNonNull(version.getFileType(),
                                                                "File type khÃ´ng Ä‘Æ°á»£c null")))
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + version.getFileName() + "\"")
                                .body(new ByteArrayResource(
                                                Objects.requireNonNull(version.getFileData(),
                                                                "File data khÃ´ng Ä‘Æ°á»£c null")));
        }

        @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "CVHT cáº­p nháº­t cÃ¢u tráº£ lá»i", description = "CVHT cáº­p nháº­t ná»™i dung tráº£ lá»i vÃ  file Ä‘Ã­nh kÃ¨m cho sinh viÃªn")
        public ResponseEntity<ApiResponse<Void>> updateQuestion(
                        @PathVariable Long id,
                        @ModelAttribute @Valid QuestionRequest request,
                        Authentication authentication) {
                String email = authentication.getName();
                UserDto userDto = userService.getUserByEmail(email);

                questionService.updateQuestion(id, userDto.getMaDinhDanh(), request);

                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .status(200)
                                .message("Cáº­p nháº­t cÃ¢u há»i thÃ nh cÃ´ng!")
                                .build());
        }

        @PostMapping(value = "/{id}/answer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "CVHT tráº£ lá»i cÃ¢u há»i", description = "CVHT gá»­i ná»™i dung tráº£ lá»i vÃ  file Ä‘Ã­nh kÃ¨m cho sinh viÃªn")
        public ResponseEntity<ApiResponse<Void>> answerQuestion(
                        @PathVariable Long id,
                        @ModelAttribute @Valid AnswerRequest request,
                        Authentication authentication) {

                String emailCvht = authentication.getName();
                questionService.answerQuestion(id, emailCvht, request);

                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .status(200)
                                .message("Tráº£ lá»i thÃ nh cÃ´ng!")
                                .build());
        }

        @PostMapping(value = "/{id}/report")
        @Operation(summary = "BÃ¡o cÃ¡o cÃ¢u há»i", description = "ÄÃ¡nh dáº¥u cÃ¢u há»i lÃ  vi pháº¡m")
        public ResponseEntity<ApiResponse<Void>> reportQuestion(
                        @PathVariable Long id,
                        @RequestParam String reason) {

                questionService.reportQuestion(id, reason);

                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .status(200)
                                .message("BÃ¡o cÃ¡o thÃ nh cÃ´ng!")
                                .build());
        }

        @GetMapping("/{id}/answers")
        @Operation(summary = "Lá»‹ch sá»­ cÃ¢u tráº£ lá»i", description = "Sinh viÃªn xem lá»‹ch sá»­ cÃ¢u tráº£ lá»i")
        public ResponseEntity<ApiResponse<List<AnswerHistoryResponse>>> getAnswerHistory(@PathVariable Long id) {

                var answerOpt = answerRepo.findByQuestion_MaCauHoi(id);
                if (answerOpt.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.<List<AnswerHistoryResponse>>builder()
                                        .status(200).message("ChÆ°a cÃ³ cÃ¢u tráº£ lá»i nÃ o").data(List.of())
                                        .build());
                }

                List<AnswerVersionJpaEntity> history = answerVersionRepo
                                .findByAnswer_IdOrderByVersionDesc(answerOpt.get().getId());

                List<AnswerHistoryResponse> response = history.stream().map(v -> {
                        String downloadUrl = null;
                        if (v.getFileData() != null) {
                                downloadUrl = "/api/questions/versions/" + v.getId() + "/file";
                        }

                        return AnswerHistoryResponse.builder()
                                        .version(v.getVersion())
                                        .noiDung(v.getNoiDung())
                                        .thoiGianTao(v.getThoiGianTao())
                                        .fileName(v.getFileName())
                                        .downloadUrl(downloadUrl)
                                        .build();
                }).toList();

                return ResponseEntity.ok(ApiResponse.<List<AnswerHistoryResponse>>builder()
                                .status(200)
                                .data(response)
                                .build());
        }

        @GetMapping("/{id}/latest-answer")
        @Operation(summary = "CÃ¢u tráº£ lá»i má»›i nháº¥t", description = "Sinh ViÃªn sáº½ xem cÃ¢u tráº£ lá»i má»›i nháº¥t")
        public ResponseEntity<ApiResponse<LatestAnswerResponse>> getLatestAnswer(@PathVariable Long id) {

                LatestAnswerResponse response = questionService.getLatestAnswer(id);

                if (response == null) {
                        return ResponseEntity.ok(ApiResponse.<LatestAnswerResponse>builder()
                                        .status(200)
                                        .message("CÃ¢u há»i chÆ°a Ä‘Æ°á»£c tráº£ lá»i")
                                        .data(null)
                                        .build());
                }

                return ResponseEntity.ok(ApiResponse.<LatestAnswerResponse>builder()
                                .status(200)
                                .message("Láº¥y cÃ¢u tráº£ lá»i thÃ nh cÃ´ng")
                                .data(response)
                                .build());
        }
}
