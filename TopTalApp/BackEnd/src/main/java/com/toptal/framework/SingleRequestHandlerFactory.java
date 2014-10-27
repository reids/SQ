package com.toptal.framework;

import org.json.JSONObject;

public interface SingleRequestHandlerFactory {

	RequestHandler createRequest (JSONObject request);
}
