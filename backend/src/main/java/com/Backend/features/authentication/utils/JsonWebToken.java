package com.Backend.features.authentication.utils;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyFactory;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JsonWebToken {

    private final RestTemplate restTemplate;

    public JsonWebToken(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Value("${jwt.secret.key}")
    private String secret;

    private static final long EXPIRATION_TIME = 10 * 60 * 60 * 1000;


    public SecretKey getKey(){
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if(keyBytes.length <32){
            throw new IllegalArgumentException("Secret key must be at least 256 bits (32 characters) long");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token){
        return extractClaim(token , Claims::getSubject);
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token); // 🚨 If invalid or expired, this will throw

            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 📆 Get token expiration date
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Claims getClaimsFromGoogleOauthIdToken(String idToken) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/certs", // 📡 Public keys for Google ID validation
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new IllegalArgumentException("Failed to fetch JWKs from Google");
            }

            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> keys = (List<Map<String, Object>>) body.get("keys");

            Jws<Claims> jws = Jwts.parserBuilder()
                    .setSigningKeyResolver(new GoogleSigningKeyResolver(keys)) // 🔑 Google signing key logic
                    .build()
                    .parseClaimsJws(idToken); // ✅ Validates the Google ID token

            return jws.getBody(); // 📦 Extracts info like email, name, sub (userId)
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to validate ID token", e);
        }
    }

    /**
     * 🛠️ Helper class to dynamically select Google public key based on the JWT header `kid`
     */
    private static class GoogleSigningKeyResolver extends SigningKeyResolverAdapter {
        private final List<Map<String, Object>> keys;

        public GoogleSigningKeyResolver(List<Map<String, Object>> keys) {
            this.keys = keys;
        }

        @Override
        public Key resolveSigningKey(JwsHeader header, Claims claims) {
            String kid = (String) header.get("kid");

            for (Map<String, Object> key : keys) {
                if (kid.equals(key.get("kid"))) {
                    try {
                        BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode((String) key.get("n")));
                        BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode((String) key.get("e")));
                        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                        return KeyFactory.getInstance("RSA").generatePublic(spec);
                    } catch (Exception e) {
                        throw new IllegalArgumentException("Failed to parse RSA public key", e);
                    }
                }
            }

            throw new IllegalArgumentException("No matching key found for kid: " + kid);
        }
    }
}
