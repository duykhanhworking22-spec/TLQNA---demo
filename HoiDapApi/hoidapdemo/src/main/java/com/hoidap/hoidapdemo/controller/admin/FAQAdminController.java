package com.hoidap.hoidapdemo.controller.admin;

import com.hoidap.hoidapdemo.entity.faq.FAQJpaEntity;
import com.hoidap.hoidapdemo.repository.faq.FAQJpaRepository;
import com.hoidap.hoidapdemo.repository.faq.FAQSpecification;
import com.hoidap.hoidapdemo.dto.faq.FAQFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin/faq")
public class FAQAdminController {
    private final FAQJpaRepository faqRepo;

    public FAQAdminController(FAQJpaRepository faqRepo) {
        this.faqRepo = faqRepo;
    }

    // 1. Danh sÃ¡ch (List) + TÃ¬m kiáº¿m
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public String index(Model model, @ModelAttribute FAQFilter filter) {
        model.addAttribute("listFAQ", faqRepo.findAll(FAQSpecification.filter(filter)));
        model.addAttribute("filter", filter);
        return "admin/faq/list";
    }

    // 2. Form ThÃªm má»›i
    @GetMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String create(Model model) {
        model.addAttribute("faq", new FAQJpaEntity());
        model.addAttribute("isEdit", false);
        return "admin/faq/form";
    }

    // 3. Form Sá»­a
    @GetMapping("/edit/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String edit(@PathVariable Long id, Model model) {
        FAQJpaEntity faq = faqRepo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("KhÃ´ng tÃ¬m tháº¥y FAQ id: " + id));
        model.addAttribute("faq", faq);
        model.addAttribute("isEdit", true);
        return "admin/faq/form";
    }

    // 4. LÆ°u (Create/Update)
    @PostMapping("/save")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String save(@ModelAttribute FAQJpaEntity faq) {
        faqRepo.save(java.util.Objects.requireNonNull(faq));
        return "redirect:/admin/faq";
    }

    // 5. XÃ³a
    @GetMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String delete(@PathVariable Long id) {
        faqRepo.deleteById(java.util.Objects.requireNonNull(id));
        return "redirect:/admin/faq";
    }
}

