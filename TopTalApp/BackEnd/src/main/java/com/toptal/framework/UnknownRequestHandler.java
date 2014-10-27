package com.toptal.framework;

import java.util.logging.Logger;

import org.json.JSONObject;

/**
 * DEfault catch all request handler when no valid handler can be found
 * @author reid
 *
 */
public class UnknownRequestHandler implements RequestHandler {

	static final Logger logger = Logger
			.getLogger(UnknownRequestHandler.class.getName());

	@Override
	public JSONObject onMessage() {

		JSONObject response = new JSONObject();
		response.put("type",  "unknownrequest_response");
		response.put("status",  "unknown request");

		return response;
	}
}
