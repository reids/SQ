package com.toptal.framework;

import org.json.JSONObject;

/**
 * Interface for a handler of a request
 * @author reid
 *
 */
public interface RequestHandler {
	
	JSONObject onMessage();
}
