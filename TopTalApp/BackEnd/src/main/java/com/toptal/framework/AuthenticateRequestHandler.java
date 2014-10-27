package com.toptal.framework;

import org.apache.log4j.Logger;
import org.json.JSONException;
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

		String userid;
		String password;
		JSONObject response;
		
		try {
			userid = request.getString("userid");
			password = request.getString("password");
		} catch (JSONException e) {
			logger.warn("Exception handling message", e);
			response = new JSONObject();
			response.put("status", "exception");
			response.put("exception", e.getMessage());
			return response;
		}

		boolean bstatus = userService.isPasswordValid(userid, password);

		response = new JSONObject();
		response.put("type", "authenticate_response");
		response.put("status", bstatus ? "authenticated" : "unauthenticated");

		return response;
	}
}
