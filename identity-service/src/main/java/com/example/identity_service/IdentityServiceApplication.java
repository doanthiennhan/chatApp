package com.example.identity_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableSpringDataWebSupport
@EnableJpaAuditing
public class IdentityServiceApplication {

	public static void main(String[] args) throws Exception {
		Dotenv dotenv = Dotenv.configure().filename(".env").load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(IdentityServiceApplication.class, args);
	}

}
