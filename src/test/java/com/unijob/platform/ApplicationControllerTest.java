package com.unijob.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.http.*;
import java.util.List;
import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApplicationControllerTest {

    private String getStatusText(int code) {

        return switch (code) {
            case 200 -> "OK";
            case 201 -> "Created";
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 404 -> "Not Found";
            case 500 -> "Internal Server Error";
            default -> "Code" + code;
        };
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void test3_GetAllApplications() {

        List<Map<String, Object>> applications = restTemplate.getForObject("/api/applications", List.class);
        assertNotNull(applications, "Список заявок не должен быть null");

        System.out.println("=".repeat(50));
        System.out.println("Тест 3: Список всех заявок");
        System.out.println("Эндпоинт: GET /api/applications");
        System.out.println("Найдено " + applications.size() + " заявок");

        if(!applications.isEmpty()) {

            System.out.println("\n Пример заявки:");
            Map<String, Object> firstApp = applications.get(0);
            System.out.println(" ID: " + firstApp.get("id"));
            System.out.println(" Статус: " + firstApp.get("status"));

            if(firstApp.get("appliedAt") != null) {

                System.out.println(" Дата подачи: " + firstApp.get("appliedAt"));
            }

        }

        System.out.println("=".repeat(50));

    }

    @Test
    void test4_CreateApplications() {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String json = """
            {
                "student": { "id": 1 },
                "vacancy": { "id": 1 },
                "status": "PENDING"
            }
            """;

        HttpEntity<String> request = new HttpEntity<>(json, headers);

        System.out.println("=".repeat(50));
        System.out.println("Тест 4: Создание новой заявки");
        System.out.println("Эндпоинт: POST /api/applications");
        System.out.println("Отправляем данные");
        System.out.println(json.replace("{", "{".replace("}", "}")));

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/applications", request, Map.class);

        assertTrue(response.getStatusCode().is2xxSuccessful(), "Заявка должна создаться успешно");

        System.out.println("\n Результат:");

        int statusCode = response.getStatusCode().value();
        System.out.println(" Статус ответа: " + statusCode + " " + getStatusText(statusCode));

        if(response.getBody() != null) {

            Map<String, Object> createdApp = response.getBody();
            System.out.println(" ID созданной заявки: " + createdApp.get("id"));
            System.out.println(" Статус заявки: " + createdApp.get("status"));

            if(createdApp.get("appliedAt") != null) {

                System.out.println(" Дата подачи: " + createdApp.get("appliedAt"));

            }

        }

        System.out.println("=".repeat(50));

    }
}
