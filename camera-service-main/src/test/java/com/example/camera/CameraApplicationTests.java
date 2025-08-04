package com.example.camera;

import com.example.camera.repository.httpClient.AgentServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(classes = CameraApplication.class)
class CameraApplicationTests {

	@MockBean
	private AgentServiceClient agentServiceClient;

	@Test
	void contextLoads() {
	}

}
