package com.hamzajg.dynamicsoft.apis;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@OpenAPIDefinition(
		info = @Info(
				contact = @Contact(name = "Hamza Jguerim", email = "hamzajg@gmail.com", url = "https://github.com/hamzajg"),
				description = "Dynamic Soft REST APIs",
				title = "Dynamic Soft REST APIs",
				version = "1.0"
		),
		servers = {
				@Server(description = "Local ENV", url = "http://localhost:8081"),
				@Server(description = "PROD ENV", url = "http://localhost:8080")
		}
)

@SpringBootApplication
public class DynamicSoftApisApplication {

	public static void main(String[] args) {
		SpringApplication.run(DynamicSoftApisApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("*")
						.allowedMethods("*")
						.allowedHeaders("*");
			}
		};
	}

}
