package com.craftai.controller;

import com.craftai.entity.AdminTemplate;
import com.craftai.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadTemplate(
            @RequestParam("adminId") String adminId,
            @RequestParam("templateName") String templateName,
            @RequestParam("image") MultipartFile image) {
        try {
            AdminTemplate savedTemplate = templateService.saveTemplate(adminId, templateName, image);
            return ResponseEntity.ok(savedTemplate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading template: " + e.getMessage());
        }
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<?> getTemplates(@PathVariable String adminId) {
        return ResponseEntity.ok(templateService.getTemplatesByAdminId(adminId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> updateTemplate(
            @PathVariable Long id,
            @RequestParam("templateName") String templateName,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            AdminTemplate updated = templateService.updateTemplate(id, templateName, image);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating template: " + e.getMessage());
        }
    }
}
