package com.hamzajg.dynamicsoft.apis.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the real security chain over HTTP: web-apis is an OAuth2 resource
 * server verifying RS256 tokens against the identity public key. The app's
 * JwtDecoder bean is wired to a throwaway keypair generated here — no
 * jwt-public.pem file needed.
 */
@SpringBootTest
@AutoConfigureMockMvc
class JwtAuthenticationTest {

    private static RSAPublicKey publicKey;
    private static RSAPrivateKey privateKey;
    private static RSAPublicKey wrongPublicKey;
    private static RSAPrivateKey wrongKey;
    private static Path publicKeyPem;

    static {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            KeyPair pair = gen.generateKeyPair();
            publicKey = (RSAPublicKey) pair.getPublic();
            privateKey = (RSAPrivateKey) pair.getPrivate();
            KeyPair other = gen.generateKeyPair();
            wrongPublicKey = (RSAPublicKey) other.getPublic();
            wrongKey = (RSAPrivateKey) other.getPrivate();
            publicKeyPem = Files.createTempFile("jwt-public", ".pem");
            Files.writeString(publicKeyPem, toPem(publicKey));
        } catch (Exception e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    @DynamicPropertySource
    static void jwtKey(DynamicPropertyRegistry registry) {
        registry.add("security.jwt.public-key-location", () -> "file:" + publicKeyPem);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousRequestIsRejected() throws Exception {
        mockMvc.perform(get("/boards")).andExpect(status().isUnauthorized());
    }

    @Test
    void validIdentityTokenIsAccepted() throws Exception {
        mockMvc.perform(bearer(token(privateKey, publicKey, "user")))
                .andExpect(status().isOk());
    }

    @Test
    void tokenWithoutTheUserRoleIsForbidden() throws Exception {
        // Identity verifies fine but carries no `groups` claim, so the
        // @RolesAllowed("user") controllers must refuse it.
        mockMvc.perform(bearer(token(privateKey, publicKey)))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenWithAnUnrelatedRoleIsForbidden() throws Exception {
        mockMvc.perform(bearer(token(privateKey, publicKey, "admin")))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenSignedByAnotherKeyIsRejected() throws Exception {
        mockMvc.perform(bearer(token(wrongKey, wrongPublicKey, "user")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void malformedTokenIsRejected() throws Exception {
        mockMvc.perform(get("/boards").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void apiDocsStayPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }

    private MockHttpServletRequestBuilder bearer(String token) {
        return get("/boards").header("Authorization", "Bearer " + token);
    }

    private static String token(RSAPrivateKey signingKey, RSAPublicKey verificationKey, String... groups) {
        RSAKey jwk = new RSAKey.Builder(verificationKey)
                .privateKey(signingKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableJWKSet(new JWKSet(jwk)));
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("https://localhost/issuer")
                .subject(UUID.randomUUID().toString())
                .claim("upn", "dev@dynamicsoft.cloud")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        if (groups.length > 0) {
            // Mirrors the claim identity signs into its tokens (UserService).
            claims.claim("groups", List.of(groups));
        }
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
    }

    private static String toPem(RSAPublicKey key) {
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(key.getEncoded());
        return "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----\n";
    }
}
