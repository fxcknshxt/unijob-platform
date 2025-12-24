package com.unijob.platform.controller;

import com.unijob.platform.entity.Message;
import com.unijob.platform.entity.User;
import com.unijob.platform.repository.MessageRepository;
import com.unijob.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "07. Сообщения", description = "Система внутренних сообщений")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageController(MessageRepository messageRepository,
                             UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все сообщения")
    public List<Message> getAll() {
        return messageRepository.findAll();
    }

    @GetMapping("/conversation/{user1Id}/{user2Id}")
    @Operation(summary = "Получить переписку между пользователями")
    public List<Message> getConversation(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        return messageRepository.findAll().stream()
                .filter(m -> (m.getSender().getId().equals(user1Id) && m.getReceiver().getId().equals(user2Id)) ||
                        (m.getSender().getId().equals(user2Id) && m.getReceiver().getId().equals(user1Id)))
                .sorted((m1, m2) -> m1.getSentAt().compareTo(m2.getSentAt()))
                .collect(Collectors.toList());
    }

    @PostMapping("/send")
    @Operation(summary = "Отправить сообщение")
    public Message sendMessage(@RequestBody Map<String, Object> request) {
        Long senderId = Long.valueOf(request.get("senderId").toString());
        Long receiverId = Long.valueOf(request.get("receiverId").toString());
        String content = (String) request.get("content");

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Отправитель не найден"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Получатель не найден"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());

        return messageRepository.save(message);
    }
}