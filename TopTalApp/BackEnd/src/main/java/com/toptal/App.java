package com.toptal;

import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;

import org.apache.log4j.Logger;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.toptal.framework.Server;

public class App {

	static final Logger logger = Logger.getLogger(App.class.getName());

	public static void main(String[] args) throws NoSuchAlgorithmException, NoSuchProviderException {
		System.out.println("load context");
		ConfigurableApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
	
		Server server = (Server) context.getBean("server");
		server.start();
		
//		User user = new User();
//		user.setId("admin@abc.com");
//		UserService userService = (UserService) context.getBean("userService");
//		userService.persistUser(user, "password");
//		System.out.println("Persisted user hash:" + userService.findUserById("admin@abc.com").getHash());
//		
//		boolean bValid = userService.isPasswordValid("admin@abc.com", "password");
//		System.out.println("PasswordValid=" + bValid);
//		
//		bValid = userService.isPasswordValid("admin@abc.com", "notvalid");
//		System.out.println("PasswordValid=" + bValid);
//		
//		userService.deleteUser(user);
		context.close();
	}

}
