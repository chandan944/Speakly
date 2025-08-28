package com.Backend.features.authentication.utils;
//
//import jakarta.mail.MessagingException;
//import jakarta.mail.internet.MimeMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.stereotype.Service;
//
//import java.io.UnsupportedEncodingException;
//
//@Service
//public class EmailService {
//    private final JavaMailSender mailSender;
//
//    public EmailService(JavaMailSender mailSender) {
//        this.mailSender = mailSender;
//    }
//
//
//    public void sendEmail(String email , String subject ,String content ) throws MessagingException , UnsupportedEncodingException {
//        MimeMessage message = mailSender.createMimeMessage();
//
//        MimeMessageHelper helper = new MimeMessageHelper(message);
//        helper.setFrom("no-reply@linkdin.com" , "Speakly");
//        helper.setTo(email);
//        helper.setSubject(subject);
//        helper.setText(content ,true);
//
//        mailSender.send(message);
//    }
//}


import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {



    public void sendEmail(String toEmail, String subject, String htmlContent) throws IOException {
        Email from = new Email();  // sender
        Email to = new Email(toEmail);                // recipient
        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail(from, subject, to, content);

        // Store API key in application.properties
        String sendGridApiKey = "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";
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            System.out.println("Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());

        } catch (IOException ex) {
            throw ex;
        }
    }
}

