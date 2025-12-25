package com.unijob.platform.config;

import com.unijob.platform.entity.*;
import com.unijob.platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo, VacancyRepository vacRepo, SkillRepository skillRepo,
                                   UserSkillRepository userSkillRepo, VacancySkillRepository vacancySkillRepo,
                                   ResumeRepository resumeRepo, EmployerRepository employerRepo,
                                   NotificationRepository notificationRepo, MessageRepository messageRepo,
                                   ReviewRepository reviewRepository, ApplicationRepository applicationRepo,
                                   InterviewRepository interviewRepo){
        return args -> {
            User studentUser = new User();
            studentUser.setName("Наруто Узумаки");
            studentUser.setEmail("uzumaki@naruto.ru");
            studentUser.setPassword("naruto123");
            studentUser.setRole(User.Role.STUDENT);
            studentUser = userRepo.save(studentUser);

            User emp = new User();
            emp.setName("Луффи");
            emp.setEmail("luffy@urfu.ru");
            emp.setPassword("qwe123");
            emp.setRole(User.Role.EMPLOYER);
            emp = userRepo.save(emp);

            Employer employer = new Employer();
            employer.setUser(emp);
            employer.setCompanyName("УрФУ");
            employer.setWebsite("https://urfu.ru/ru/");
            employer = employerRepo.save(employer);

            Review review1 = new Review();
            review1.setAuthor(emp);
            review1.setTarget(studentUser);
            review1.setRating(5);
            review1.setText("Крутой перец!");
            reviewRepository.save(review1);

            Vacancy vac1 = new Vacancy();
            vac1.setTitle("Ассистент преподавателя");
            vac1.setDescription("Проверка работ");
            vac1.setType("WORK");
            vac1.setActive(true);
            vac1.setEmployer(employer);
            vacRepo.save(vac1);

            Vacancy vac2 = new Vacancy();
            vac2.setTitle("Лаборант");
            vac2.setDescription("Работа с данными");
            vac2.setType("ASSISTANT");
            vac2.setActive(true);
            vac2.setEmployer(employer);
            vacRepo.save(vac2);

            Skill java = new Skill();
            java.setName("Java");
            java = skillRepo.save(java);

            Skill python = new Skill();
            python.setName("Python");
            python = skillRepo.save(python);

            Skill excel = new Skill();
            excel.setName("Excel");
            excel = skillRepo.save(excel);

            Application application = new Application();
            application.setStudent(studentUser);
            application.setVacancy(vac1);
            application.setStatus(Application.Status.ACCEPTED);
            application.setCoverLetter("Хочу работать!");
            application.setAppliedAt(LocalDateTime.now().minusHours(2));
            application = applicationRepo.save(application);

            if (interviewRepo != null){
                try{
                    Interview interview = new Interview();
                    interview.setApplication(application);
                    interview.setInterviewDate(LocalDateTime.now().plusDays(2));
                    interview.setLocation("Главный корпус, кабинет 322");
                    interview.setInterviewType("OFFLINE");
                    interview.setStatus("SCHEDULED");
                    interview.setNotes("Первое собеседование");
                    interviewRepo.save(interview);

                    System.out.println("Создано собеседование на " + interview.getInterviewDate().toLocalDate() +
                            " (ID: " + interview.getId() + ")");
                } catch (Exception e) {
                    System.out.println("Не удалось создать собеседование: " + e.getMessage());
                }
            } else {
                System.out.println("InterviewRepository недоступен");
            }

            if (interviewRepo != null){
                try{
                    Interview interview2 = new Interview();
                    interview2.setApplication(application);
                    interview2.setInterviewDate(LocalDateTime.now().plusDays(7));
                    interview2.setLocation("Онлайн (Discord)");
                    interview2.setInterviewType("ONLINE");
                    interview2.setStatus("SCHEDULED");
                    interview2.setNotes("Второй этап собеседования.");
                    interview2.setCreatedAt(LocalDateTime.now());
                    interviewRepo.save(interview2);

                    System.out.println("Создано второе собеседование (в онлайн формате)");
                } catch (Exception e){
                    System.out.println("Не удалось создать второе собеседование");
                }
            }

            UserSkill us1 = new UserSkill();
            us1.setUser(emp);
            us1.setSkill(java);
            userSkillRepo.save(us1);

            UserSkill us2 = new UserSkill();
            us2.setUser(emp);
            us2.setSkill(python);
            userSkillRepo.save(us2);

            VacancySkill vs1 = new VacancySkill();
            vs1.setVacancy(vac1);
            vs1.setSkill(java);
            vacancySkillRepo.save(vs1);

            VacancySkill vs2 = new VacancySkill();
            vs2.setVacancy(vac2);
            vs2.setSkill(python);
            vacancySkillRepo.save(vs2);

            Resume resume = new Resume();
            resume.setStudent(emp);
            resume.setText("Стаж работы 2 года + стажировки, имеются проекты и сертификаты о прохождении курсов");
            resumeRepo.save(resume);

            Notification notify = new Notification();
            notify.setUser(emp);
            notify.setText("Добро пожаловать в систему вакансий");
            notify.setRead(false);
            notificationRepo.save(notify);

            Message msg = new Message();
            msg.setSender(emp);
            msg.setReceiver(emp);
            msg.setContent("Удачи в поиске работы");
            messageRepo.save(msg);

        };
    }
}