package com.toptal.framework;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.json.JSONObject;

import com.toptal.model.User;
import com.toptal.service.UserService;

//@formatter:off
/**
* Manage createuser requests, store users and generate salts and hashes
* @author reid
*
* Input: {
*			"type": "createuser",
*			"userid": "test@testing.com",
*		    "password":"test"
*		  }
*
*Output {
*			"type": "createuser_response",
*			"status": ["created" | "error"]
*		  }
* 
*
*/
//@formatter:on
public class CreateUserRequestHandler implements RequestHandler {

	static final Logger logger = Logger
			.getLogger(CreateUserRequestHandler.class.getName());

	private JSONObject request;
	private UserService userService;
	
	public CreateUserRequestHandler(JSONObject request, UserService userService) {
		this.request = request;
		this.userService = userService;
	}

	@Override
	public JSONObject onMessage() {

		String userid = request.getString("userid");
		String password = request.getString("password");
		
		User user = new User();
		user.setId(userid);
		
		boolean bstatus = false;
		try {
			userService.persistUser(user, password);
			bstatus = true;
		} catch (HibernateException e) {
			logger.error("Exception creating user", e);
		}

		JSONObject response = new JSONObject();
		response.put("type",  "createuser_response");
		response.put("status", bstatus ? "created" : "error");
		
		return response;
	}
}
