package com.servexa.auth.service;

import com.servexa.auth.entity.Admin;
import com.servexa.auth.repository.AdminRepository;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {
    private AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    //get admin by id
    public Admin getAdminById(Long id) {
        Optional<Admin> admin = adminRepository.findById(id);
        return admin.orElse(null);
    }

     // Update admin details partially
    public Admin updateAdminPartial(Long id, Admin updatedAdmin) {
        Optional<Admin> optionalAdmin = adminRepository.findById(id);

        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();

            if (updatedAdmin.getFullName() != null) {
                admin.setFullName(updatedAdmin.getFullName());
            }
            if (updatedAdmin.getEmail() != null) {
                admin.setEmail(updatedAdmin.getEmail());
            }
            if (updatedAdmin.getPhoneNumber() != null) {
                admin.setPhoneNumber(updatedAdmin.getPhoneNumber());
            }
            // Profile image is updated separately via upload endpoint

            return adminRepository.save(admin);
        } else {
            return null;
        }
    }

    //upload profile image
    public Admin updateProfileImage(Long id, MultipartFile file) throws IOException{
        Optional<Admin> optionalAdmin= adminRepository.findById(id);

        if(optionalAdmin.isPresent()){
            Admin admin = optionalAdmin.get();

            //Assuming profile image is stored as byte array
            admin.setProfileImage(file.getBytes());
            return adminRepository.save(admin);
        }else{
            return null;
        }

    }

    
}
