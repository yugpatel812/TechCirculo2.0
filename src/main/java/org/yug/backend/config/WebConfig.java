package org.yug.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Since application.yml defines spring.web.resources.static-locations: classpath:/static/,file:uploads/
        // Spring Boot automatically maps /** to these locations.
        // No manual mapping needed for /uploads/** as it's handled by Spring Boot defaults.

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}