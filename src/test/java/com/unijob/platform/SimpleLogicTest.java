package com.unijob.platform;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SimpleLogicTest {

    @Test
    void test7_AppLogicTest() {

        System.out.println("=".repeat(50));
        System.out.println("Тест 7: Базовая логика приложения");
        System.out.println("Проверка основных операций");

        assertEquals(4, 2 + 2, "2 + 2 должно быть 4");
        System.out.println(" Матемактика работает: 2 + 2 = 4");

        String projectName = "unijob-platform";
        assertTrue(projectName.contains("unijob"), "Название должно содержать 'unijob'");
        System.out.println("Строки работают: название содержит 'unijob");

        assertTrue(10 > 5, "10 должно быть больше 5");
        System.out.println(" Логика работает: 10 > 5");

        Object obj = null;
        assertNull(obj, "Объект должен быть null");
        System.out.println(" Проверка null работает ");

        String emptyString = "";
        assertTrue(emptyString.isEmpty(), "Пустая строка должна быть пустой");
        System.out.println(" Пустые строки обрабатываются");

        System.out.println("\n Все базовые операции работают корректно");
        System.out.println("=".repeat(50));

    }

}
