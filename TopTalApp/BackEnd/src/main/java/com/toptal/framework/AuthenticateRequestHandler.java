package com.toptal.framework;

import java.util.logging.Logger;

import org.json.JSONObject;

import com.toptal.service.UserService;

//@formatter:off
/**
 * Manage authentication requests, hash incoming users and compare to the DB hashes in the auth DB
 * @author reid
 *
 * Input: {
 *			"type": "authenticate",
 *			"userid": "test@testing.com",
 *		    "password":"test"
 *		  }
 *
 *Output {
 *			"type": "authenticate_response",
 *			"status": ["authenticated" | "unauthenticated"]
 *		  }
 * 
 *
 */
//@formatter:on
public class AuthenticateRequestHandler implements RequestHandler {

	static final Logger logger = Logger
			.getLogger(AuthenticateRequestHandler.class.getName());

	private JSONObject request;
	private UserService userService;

	public AuthenticateRequestHandler(JSONObject request,
			UserService userService) {
		this.request = request;
		this.userService = userService;
	}

	@Override
	public JSONObject onMessage() {

		String userid = request.getString("userid");
		String password = request.getString("password");

		boolean bstatus = userService.isPasswordValid(userid, password);

		JSONObject response = new JSONObject();
		response.put("type", "authenticate_response");
		response.put("status", bstatus ? "authenticated" : "unauthenticated");

		return response;
	}
}
