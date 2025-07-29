package com.example.mailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class MailServiceApplication {
	@Autowired
	EmailSenderService emailSenderService;

	public static void main(String[] args) {
		SpringApplication.run(MailServiceApplication.class, args);
	}
	@EventListener(ApplicationReadyEvent.class)
	public void sendMail(){
		emailSenderService.sendEmail("nhanthien2792003@gamil.com","NhanDT19","Doãn Thiên Nhân 2003");
	}

}
