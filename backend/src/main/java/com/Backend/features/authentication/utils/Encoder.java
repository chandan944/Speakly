package com.Backend.features.authentication.utils;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class Encoder {

    public String encode(CharSequence rawPassword){
        try{
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash =digest.digest(rawPassword.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error during encoding password!", e);
        }
    }

    public boolean matches(CharSequence rawPassword , String encodedPassword){
        return encode(rawPassword).equals(encodedPassword);
    }

}
