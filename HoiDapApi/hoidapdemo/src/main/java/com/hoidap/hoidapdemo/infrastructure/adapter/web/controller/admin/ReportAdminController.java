package com.hoidap.hoidapdemo.infrastructure.adapter.web.controller.admin;

import com.hoidap.hoidapdemo.application.service.QuestionServiceImpl;
import com.hoidap.hoidapdemo.domain.model.QuestionStatus;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.common.PageResponse;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.question.QuestionFilter;
import com.hoidap.hoidapdemo.infrastructure.adapter.web.dto.question.QuestionResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin/reports")
public class ReportAdminController {
    private final QuestionServiceImpl questionService;

    public ReportAdminController(QuestionServiceImpl questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public String listReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Model model) {

        QuestionFilter filter = new QuestionFilter();
        filter.setStatus(QuestionStatus.REPORTED);

        PageResponse<QuestionResponse> pageData = questionService.getAllQuestions(filter, page, size);

        model.addAttribute("listQuestions", pageData.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", pageData.getTotalPages());
        model.addAttribute("totalItems", pageData.getTotalElements());

        return "admin/report/list";
    }

    @GetMapping("/delete/{id}")
    public String deleteReportedQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return "redirect:/admin/reports";
    }

    // Feature to dismiss report (restore to PENDING) - for future implementation
    @GetMapping("/dismiss/{id}")
    public String dismissReport(@PathVariable Long id) {
        // Implement logic to set status back to PENDING/ANSWERED or delete the report
        // reason
        // For now, redirect back
        return "redirect:/admin/reports";
    }
}
