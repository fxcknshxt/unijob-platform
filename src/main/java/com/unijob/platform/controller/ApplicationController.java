package com.unijob.platform.controller;

import java.util.List;
import com.unijob.platform.entity.Application;
import com.unijob.platform.repository.ApplicationRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")

public class ApplicationController {

    private final ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationRepository applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    @GetMapping
    public List<Application> getAll(){
        return applicationRepository.findAll();
    }

    @GetMapping("/{id}")
    public Application getOne(@PathVariable Long id){
        return applicationRepository.findById(id).orElseThrow();
    }
}
