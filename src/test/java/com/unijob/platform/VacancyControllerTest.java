package com.unijob.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;
import java.util.List;
import javax.swing.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class VacancyControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void test1_GetAllVacancies() {

        List<Map<String, Object>> vacancies = restTemplate.getForObject("/api/vacancies", List.class);
        assertNotNull(vacancies, "Список вакансий не должен быть null");

        System.out.println("=".repeat(50));
        System.out.println("Тест 1: Список всех вакансий");
        System.out.println("Эндпоинт: GET api/vacancies");
        System.out.println("Найдено вакансий: " + vacancies.size());

        if(!vacancies.isEmpty()) {

            System.out.println("\n Пример вакансии: ");
            Map<String, Object> firstVacancy = vacancies.get(0);
            System.out.println(" ID: " + firstVacancy.get("id"));
            System.out.println(" Название: \"" + firstVacancy.get("title") + "\"");
            System.out.println(" Тип: " + firstVacancy.get("type"));

        }

        System.out.println("=".repeat(50));

    }

    @Test
    void test2_GetVacancyById() {

        Map<String, Object> vacancy = restTemplate.getForObject("/api/vacancies/1", Map.class);
        assertNotNull(vacancy, "Вакансия с ID = 1 должна существовать");

        System.out.println("=".repeat(50));
        System.out.println("Тест 2: Детали вакансии");
        System.out.println("ID: " + vacancy.get("id"));
        System.out.println("Название: \"" + vacancy.get("title") + "\"");
        System.out.println("Тип: " + vacancy.get("type"));
        System.out.println("Активна: " + (Boolean.TRUE.equals(vacancy.get("active")) ? "Да" : "Нет"));


        String description = (String) vacancy.get("description");
        if(description != null && description.length() > 50) {

            System.out.println("Описание: \"" + description.substring(0, 50) + "...\"");

        }

        else if(description !=null) {

            System.out.println("Описание: \"" + description + "\"");

        }

        System.out.println("=".repeat(50));

    }
}
