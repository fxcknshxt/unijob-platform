package com.unijob.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class UserControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void test5_GetAllUsers() {

        List<Map<String, Object>> users = restTemplate.getForObject("/api/users", List.class);
        assertNotNull(users, "Список пользователей не должен быть null");

        System.out.println("=".repeat(50));
        System.out.println("Тест 5: Список всех пользователей");
        System.out.println("Эндпоинт: GET /api/users");
        System.out.println("Найдено пользователей: " + users.size());

        if(!users.isEmpty()) {

            System.out.println("\n Пример пользователя:");
            Map<String, Object> firstUser = users.get(0);
            System.out.println(" ID: " + firstUser.get("id"));
            System.out.println(" Имя: \"" + firstUser.get("name") + "\"");
            System.out.println(" Роль: " + firstUser.get("role"));
            System.out.println(" Email% " + firstUser.get("email"));

        }

        System.out.println("=".repeat(50));

    }

    @Test
    void test6_GetUserById() {

        Map<String, Object> user = restTemplate.getForObject("/api/users/1", Map.class);
        assertNotNull(user, "Пользователь с ID = 1 должен существовать");

        System.out.println("=".repeat(50));
        System.out.println("Тест 6: Данные пользователя");
        System.out.println("Эндпоинт: GET /api/users/1");
        System.out.println("\n Профиль пользователя:");
        System.out.println(" ID: " + user.get("id"));
        System.out.println(" Имя: \"" + user.get("name") + "\"");
        System.out.println(" Email: " + user.get("email"));
        System.out.println("Роль: " + user.get("role"));

        if(user.get("createdAt") != null) {

            System.out.println(" Дата регистрации: " + user.get("createdAt"));

        }

        System.out.println("=".repeat(50));

    }
}
