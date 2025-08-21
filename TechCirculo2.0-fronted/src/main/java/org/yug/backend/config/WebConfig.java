package org.yug.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/profile-pics/** → your configured profile pics folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
        
        // Map /uploads/posts/** → posts images folder (in project root)
        registry.addResourceHandler("/uploads/posts/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/posts/");
                
        // General uploads mapping (fallback) - also in project root
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
    }
}