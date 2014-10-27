package com.toptal.framework;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;

import com.toptal.service.UserService;
/**
 * Factors for request handlers
 * @author reid
 *
 */
public class SingleRequestHandlerFactoryImpl implements SingleRequestHandlerFactory {

	enum RequestType {AUTHENTICATE, CREATEUSER, UNKNOWN};
	protected static final String TYPE = "type";
	
	@Autowired
	UserService userService;
	
	public SingleRequestHandlerFactoryImpl() {
	}

	@Override
	public RequestHandler createRequest(JSONObject request) {

		String strType = request.getString(TYPE);
		RequestType type = RequestType.UNKNOWN;
		try {
			type = RequestType.valueOf(strType.toUpperCase());
		} catch (Exception e) {
		}
		
		switch (type) {
		case AUTHENTICATE:
			return new AuthenticateRequestHandler(request, userService);
		case CREATEUSER:
			return new CreateUserRequestHandler(request, userService);			
		default:
			return new UnknownRequestHandler();
		}
	}
	

}
