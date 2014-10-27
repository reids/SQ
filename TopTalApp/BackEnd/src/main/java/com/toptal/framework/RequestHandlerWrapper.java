package com.toptal.framework;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageProducer;

import org.apache.activemq.command.ActiveMQTextMessage;
import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

public class RequestHandlerWrapper implements Runnable {

	static final Logger logger = Logger.getLogger(RequestHandlerWrapper.class.getName());

	private final RequestHandler handler;
	private final Message msg;
	private final MessageProducer producer;
	
	public RequestHandlerWrapper(RequestHandler handler, Message msg, MessageProducer producer) {
		this.handler = handler;
		this.msg = msg;
		this.producer = producer;
	}
	
	@Override
	public void run() {
		JSONObject response;
		
		try {
			response = handler.onMessage();
			// Parcel up the response and put on the queue
			ActiveMQTextMessage reply = new ActiveMQTextMessage();
			reply.setText(response.toString());
			reply.setJMSCorrelationID(msg.getJMSCorrelationID());
//			MessageProducers are not officially threadsafe, ActiveMQ is ok for non transacted messages
//			but good form to sync on it, or closure, callback, producer per thread etc etc
			synchronized (producer) {
				producer.send(reply);
			}
		} catch (JSONException e) {
			logger.warn("Exception handling message", e);
			response = new JSONObject();
			response.put("status", "exception");
			response.put("exception", e.getMessage());
		}
		catch (JMSException e) {
			logger.error("Exception from activeMQ", e);
		}
	}

}
