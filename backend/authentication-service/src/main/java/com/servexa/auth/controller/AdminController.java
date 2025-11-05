package com.servexa.auth.controller;
import com.servexa.auth.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import com.servexa.auth.entity.Admin;


@RestController
@RequestMapping("/api/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/{id}")
    public Admin getAdminById(@PathVariable Long id){
        return adminService.getAdminById(id);
    }

    @PutMapping("/{id}")
    public Admin updateAdmin(@PathVariable Long id, @RequestBody Admin updatedAdmin){
        return adminService.updateAdminPartial(id, updatedAdmin);
    }

@PostMapping(value = "/{id}/upload", consumes = {"multipart/form-data"})
public ResponseEntity<Admin> uploadProfile(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
    Admin updatedAdmin = adminService.updateProfileImage(id, file);
    if (updatedAdmin != null) {
        return ResponseEntity.ok(updatedAdmin);
    }
    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
}

@PatchMapping("/{id}")
public ResponseEntity<?> updateAdminPartial(
        @PathVariable Long id,
        @RequestBody Admin updatedAdmin) {

    Admin updated = adminService.updateAdminPartial(id, updatedAdmin);
    if (updated == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body("Admin not found");
    }
    return ResponseEntity.ok(updated);
}



    
}
