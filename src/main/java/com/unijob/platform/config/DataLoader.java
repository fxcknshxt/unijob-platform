package com.unijob.platform.config;

import com.unijob.platform.entity.User;
import com.unijob.platform.entity.Vacancy;
import com.unijob.platform.repository.UserRepository;
import com.unijob.platform.repository.VacancyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo, VacancyRepository vacRepo){
        return args -> {
            User emp = new User();
            emp.setName("Луффи");
            emp.setEmail("luffy@urfu.ru");
            emp.setPassword("qwe123");
            emp.setRole(User.Role.EMPLOYER);
            emp = userRepo.save(emp);

            Vacancy vac1 = new Vacancy();
            vac1.setTitle("Ассистент преподавателя");
            vac1.setDescription("Проверка работ");
            vac1.setType("WORK");
            vac1.setActive(true);
            vac1.setEmployer(emp);
            vacRepo.save(vac1);

            Vacancy vac2 = new Vacancy();
            vac2.setTitle("Лаборант");
            vac2.setDescription("Работа с данными");
            vac2.setType("laboratory assistant");
            vac2.setActive(true);
            vac2.setEmployer(emp);
            vacRepo.save(vac2);

        };
    }
}
