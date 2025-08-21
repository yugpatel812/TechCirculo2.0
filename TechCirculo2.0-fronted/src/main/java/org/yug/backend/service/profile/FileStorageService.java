package org.yug.backend.service.profile;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {

    private final String UPLOAD_DIR = "uploads/profile-pics/";

    public String save(MultipartFile file) {
        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file with unique name
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // Return relative URL for frontend (e.g. /uploads/profile-pics/12345_pic.jpg)
            return "/uploads/profile-pics/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
