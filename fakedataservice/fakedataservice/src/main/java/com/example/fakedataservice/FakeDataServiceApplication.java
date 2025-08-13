package com.example.fakedataservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FakeDataServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FakeDataServiceApplication.class, args);
	}

}
