package com.example.server.controller.ChatBot;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "chat_message")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private String sessionId;

    @Enumerated(EnumType.STRING)
    private Sender sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    private Date timestamp = new Date();

    public enum Sender { USER, BOT, STAFF }
    public enum MessageType { TEXT, IMAGE, PRODUCT }

    // Constructors
    public ChatMessage() {}
    public ChatMessage(String sessionId, Sender sender, String message, MessageType messageType) {
        this.sessionId = sessionId;
        this.sender = sender;
        this.message = message;
        this.messageType = messageType;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Sender getSender() { return sender; }
    public void setSender(Sender sender) { this.sender = sender; }
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}