package org.yug.backend.service.profile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;


    public String saveFile(MultipartFile file, String subDir) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            // Create upload directory path
            Path uploadPath = Path.of(uploadDir, subDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative URL (e.g., /uploads/posts/uuid.jpg)
            // Note: uploadDir is usually "./uploads", so we want to return "/uploads/subDir/filename"
            // We strip the leading dot if present for the URL
            String normalizedUploadDir = uploadDir.startsWith("./") ? uploadDir.substring(1) : uploadDir;
            if (!normalizedUploadDir.startsWith("/")) {
                normalizedUploadDir = "/" + normalizedUploadDir;
            }
            
            return normalizedUploadDir + "/" + subDir + "/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
