/**
 * 
 */
package springexample;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import javax.jms.JMSException;

import org.json.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.toptal.framework.AuthenticateRequestHandler;
import com.toptal.framework.CreateUserRequestHandler;
import com.toptal.framework.RequestHandler;
import com.toptal.framework.SingleRequestHandlerFactory;
import com.toptal.framework.UnknownRequestHandler;
import com.toptal.model.User;
import com.toptal.service.UserService;

/**
 * @author reid
 * 
 */
public class TestUserRequestHandler {

	private static ConfigurableApplicationContext context;
	private static UserService userService;
	private static SingleRequestHandlerFactory factory;

	/**
	 * @throws java.lang.Exception
	 */
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		System.out.println("load context");
		context = new ClassPathXmlApplicationContext("testContext.xml");

		userService = (UserService) context.getBean("userService");
		factory = (SingleRequestHandlerFactory) context
				.getBean("singleRequestHandlerFactory");
	}

	/**
	 * @throws java.lang.Exception
	 */
	@AfterClass
	public static void tearDownAfterClass() throws Exception {
		// Delete the user
		context.close();
	}

	@After
	public void tearDown() throws Exception {
		// Delete the user
		User user = new User();
		user.setId("test@testing.com");
		userService.deleteUser(user);
	}

	/**
	 * Test creating requests
	 */
	@Test
	public void test1() {
		RequestHandler handler;

		JSONObject request;

		request = new JSONObject();
		request.put("type", "authenticate");
		request.put("userid", "test@testing.com");
		request.put("password", "test");

		handler = factory.createRequest(request);
		assertNotNull(handler);
		assertTrue(handler instanceof AuthenticateRequestHandler);

		request.put("type", "invalid");
		handler = factory.createRequest(request);
		assertNotNull(handler);
		assertTrue(handler instanceof UnknownRequestHandler);

		request = new JSONObject();
		request.put("type", "createuser");
		request.put("userid", "test@testing.com");
		request.put("password", "test");
		handler = factory.createRequest(request);
		assertNotNull(handler);
		assertTrue(handler instanceof CreateUserRequestHandler);
	}

	/**
	 * Test creating a user
	 */
	@Test
	public void test2() {

		RequestHandler handler;

		// Set up the user
		JSONObject request = new JSONObject();
		request.put("type", "createuser");
		request.put("userid", "test@testing.com");
		request.put("password", "test");

		handler = factory.createRequest(request);
		JSONObject response = handler.onMessage();

		assertEquals("created", response.getString("status") );

	}

	/**
	 * Test processing of an authenticate request
	 */
	@Test
	public void test3() throws JMSException {
		RequestHandler handler;

		// Set up the user
		JSONObject request = new JSONObject();
		request.put("type", "createuser");
		request.put("userid", "test@testing.com");
		request.put("password", "test");
		handler = factory.createRequest(request);
		handler.onMessage();

		request = new JSONObject();
		request.put("type", "authenticate");
		request.put("userid", "test@testing.com");
		request.put("password", "test");
		handler = factory.createRequest(request);
		handler.onMessage();

		handler = factory.createRequest(request);
		JSONObject response;
		response = handler.onMessage();

		assertEquals(response.getString("status"), "authenticated");

		request.put("password", "not the password");
		response = handler.onMessage();
		assertEquals(response.getString("status"), "unauthenticated");

	}
	/**
	 * Test processing of bad requests 
	 */
	@Test
	public void test4() {
		RequestHandler handler;

		JSONObject request;
		JSONObject response;
		request = new JSONObject();
		request.put("type", "invalid");
		request.put("userid", "test@testing.com");
		request.put("password", "test");
		handler = factory.createRequest(request);
		response = handler.onMessage();

		assertEquals(response.getString("status"), "unknown request");
		
		// Test Missing fields
		request = new JSONObject();
		request.put("type", "authenticate");
		handler = factory.createRequest(request);
		response = handler.onMessage();
		
		assertEquals("exception", response.getString("status") );
		

	}
}
