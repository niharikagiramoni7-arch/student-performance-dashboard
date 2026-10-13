package com.studentdashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    private final String resendApiKey;
    private final String brevoApiKey;
    private final String fromEmail;
    private final String fromName;

    public EmailService(
            ObjectMapper objectMapper,
            @Value("${app.mail.resend-api-key:}") String resendApiKey,
            @Value("${app.mail.brevo-api-key:}") String brevoApiKey,
            @Value("${app.mail.from-email:onboarding@resend.dev}") String fromEmail,
            @Value("${app.mail.from-name:Student Performance Dashboard}") String fromName) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        this.resendApiKey = resendApiKey != null ? resendApiKey.trim() : "";
        this.brevoApiKey = brevoApiKey != null ? brevoApiKey.trim() : "";
        this.fromEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : "onboarding@resend.dev";
        this.fromName = (fromName != null && !fromName.isBlank()) ? fromName.trim() : "Student Performance Dashboard";
    }

    public boolean isResendConfigured() {
        if (resendApiKey.isBlank()
                || resendApiKey.equalsIgnoreCase("your_resend_api_key")
                || resendApiKey.contains("your_")
                || resendApiKey.length() < 10) {
            return false;
        }
        return true;
    }

    public boolean isBrevoConfigured() {
        if (brevoApiKey.isBlank()
                || brevoApiKey.equalsIgnoreCase("your_brevo_api_key")
                || brevoApiKey.contains("your_")
                || brevoApiKey.length() < 15) {
            return false;
        }
        return true;
    }

    public boolean isConfigured() {
        return isResendConfigured() || isBrevoConfigured();
    }

    public void sendOtpEmail(String toEmail, String otp) {
        if (toEmail == null || toEmail.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Recipient email is required.");
        }
        String recipient = toEmail.trim().toLowerCase();
        log.info(">> [OTP NOTIFICATION DISPATCH] Recipient: {}", recipient);

        // 1. If Brevo is configured, use Brevo as primary (delivers to ALL email addresses dynamically without domain restrictions)
        if (isBrevoConfigured()) {
            sendViaBrevoApi(recipient, otp);
            return;
        }

        // 2. If Resend is configured, use Resend
        if (isResendConfigured()) {
            sendViaResendApi(recipient, otp);
            return;
        }

        log.warn("Email dispatch rejected: No valid email service configured in .env.");
        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Email sending failure: No active email service configured in .env. Please configure BREVO_API_KEY or RESEND_API_KEY in your .env file."
        );
    }

    private void sendViaResendApi(String toEmail, String otp) {
        String htmlBody = buildHtmlBody(otp);
        String plainText = buildPlainText(otp);

        String senderFrom;
        if (fromEmail.contains("<") && fromEmail.contains(">")) {
            senderFrom = fromEmail;
        } else if (fromName != null && !fromName.isBlank()) {
            senderFrom = fromName + " <" + fromEmail + ">";
        } else {
            senderFrom = fromEmail;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "from", senderFrom,
                    "to", List.of(toEmail),
                    "subject", "Student Performance Dashboard - Verification Code",
                    "html", htmlBody,
                    "text", plainText
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();
            String responseBody = response.body();

            if (statusCode >= 200 && statusCode < 300) {
                log.info(">> [RESEND API] Verification code successfully sent to {}", toEmail);
            } else {
                String errMsg = extractResendErrorMessage(responseBody, statusCode);
                log.error(">> [RESEND API] Delivery failed to {}: HTTP {} - {}", toEmail, statusCode, errMsg);
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Email sending failure via Resend: " + errMsg
                );
            }
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            log.error(">> [RESEND API] Exception delivering OTP to {}: {}", toEmail, e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Email sending failure: Unable to reach Resend API. " + e.getMessage()
            );
        }
    }

    private void sendViaBrevoApi(String toEmail, String otp) {
        String htmlBody = buildHtmlBody(otp);
        String plainText = buildPlainText(otp);

        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", "Student Performance Dashboard - Verification Code",
                    "htmlContent", htmlBody,
                    "textContent", plainText
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info(">> [BREVO API] Verification code successfully sent to {}", toEmail);
            } else {
                String errMsg = extractBrevoErrorMessage(response.body(), response.statusCode());
                log.error(">> [BREVO API] Delivery failed to {}: HTTP {} - {}", toEmail, response.statusCode(), errMsg);
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Email sending failure via Brevo: " + errMsg
                );
            }
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            log.error(">> [BREVO API] Exception delivering OTP to {}: {}", toEmail, e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Email sending failure: Unable to reach Brevo API. " + e.getMessage()
            );
        }
    }

    private String extractResendErrorMessage(String body, int statusCode) {
        if (body == null || body.isBlank()) {
            return "HTTP " + statusCode;
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.hasNonNull("message")) {
                String msg = node.get("message").asText();
                if (node.hasNonNull("name")) {
                    return msg + " (" + node.get("name").asText() + ")";
                }
                return msg;
            }
            if (node.hasNonNull("error")) {
                return node.get("error").asText();
            }
        } catch (Exception ignored) {
        }
        return "HTTP " + statusCode + ": " + (body.length() > 200 ? body.substring(0, 200) : body);
    }

    private String extractBrevoErrorMessage(String body, int statusCode) {
        if (body == null || body.isBlank()) {
            return "HTTP " + statusCode;
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            if (node.hasNonNull("message")) {
                return node.get("message").asText();
            }
            if (node.hasNonNull("code")) {
                return node.get("code").asText();
            }
        } catch (Exception ignored) {
        }
        return "HTTP " + statusCode + ": " + (body.length() > 100 ? body.substring(0, 100) : body);
    }

    private String buildHtmlBody(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,0.06);overflow:hidden;">
                <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px;text-align:center;color:#ffffff;">
                  <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Student Performance Dashboard</h1>
                  <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Secure Account Verification</p>
                </div>
                <div style="padding:28px 24px;color:#1e293b;">
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hello,</p>
                  <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#475569;">
                    Use the 6-digit verification code below to complete your authentication. This code is confidential and expires in <strong>5 minutes</strong>.
                  </p>
                  <div style="background:#f1f5f9;border:2px dashed #93c5fd;border-radius:10px;padding:16px;text-align:center;margin:24px 0;">
                    <span style="font-size:34px;font-weight:900;letter-spacing:10px;color:#1d4ed8;font-family:monospace;display:inline-block;padding-left:10px;">%s</span>
                  </div>
                  <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.4;">
                    ⏱️ <strong>Validity:</strong> 5 minutes from request time.
                  </p>
                  <p style="margin:0;font-size:13px;color:#64748b;line-height:1.4;">
                    🔒 Never share this verification code with anyone. University administrators will never ask for your OTP.
                  </p>
                </div>
                <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
                  If you did not initiate this request, you can safely ignore this email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(otp);
    }

    private String buildPlainText(String otp) {
        return "Your Student Performance Dashboard verification code is: " + otp
                + "\n\nThis code expires in 5 minutes.\nIf you did not request this, please ignore this email.";
    }
}
