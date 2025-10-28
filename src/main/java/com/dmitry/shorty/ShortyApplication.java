package com.dmitry.shorty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShortyApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShortyApplication.class, args);
    }
}
