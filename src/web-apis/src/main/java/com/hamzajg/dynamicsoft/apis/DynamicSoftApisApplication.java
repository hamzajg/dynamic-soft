package com.hamzajg.dynamicsoft.apis;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

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
		},
		security = @SecurityRequirement(name = "bearerAuth")
)

@SpringBootApplication(scanBasePackages = "com.hamzajg.dynamicsoft")
@EnableWebSecurity
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
	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.components(new Components()
						.addSecuritySchemes("bearerAuth", new SecurityScheme()
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}

	@Bean
	public JwtDecoder jwtDecoder(@Value("${security.jwt.public-key-location}") String location) {
		try {
			String path = location.startsWith("file:") ? location.substring("file:".length()) : location;
			String pem = Files.readString(Path.of(path));
			String base64 = pem
					.replace("-----BEGIN PUBLIC KEY-----", "")
					.replace("-----END PUBLIC KEY-----", "")
					.replaceAll("\\s", "");
			byte[] keyBytes = Base64.getDecoder().decode(base64);
			PublicKey key = KeyFactory.getInstance("RSA")
					.generatePublic(new X509EncodedKeySpec(keyBytes));
			return NimbusJwtDecoder.withPublicKey((java.security.interfaces.RSAPublicKey) key).build();
		} catch (Exception e) {
			throw new IllegalStateException(
					"Cannot load JWT public key from '" + location + "'. Generate the identity "
							+ "keypair and derive the public key — see application.properties.", e);
		}
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOriginPatterns(java.util.List.of("*"));
		config.setAllowedMethods(java.util.List.of("*"));
		config.setAllowedHeaders(java.util.List.of("*"));
		config.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.authorizeHttpRequests((requests) -> requests
						.requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/webjars/**").permitAll()
						.anyRequest().authenticated())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}
}