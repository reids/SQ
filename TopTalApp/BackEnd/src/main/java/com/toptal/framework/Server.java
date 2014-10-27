package com.toptal.framework;

import javax.annotation.PostConstruct;
import javax.jms.BytesMessage;
import javax.jms.Connection;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.command.ActiveMQQueue;
import org.apache.activemq.command.ActiveMQTextMessage;
import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

public class Server {

	static final Logger logger = Logger.getLogger(Server.class.getName());

	SingleRequestHandlerFactory requestHandlerFactory;
	boolean bExit = false;
	private MessageConsumer consumer;
	private MessageProducer producer;

	private Connection connection;

	public Server() {
	}
	
	/**
	 * Create connection to broker, want to fail fast fail early
	 * @throws JMSException
	 */
	@PostConstruct
	public void initialize() throws JMSException {
		String user = env("ACTIVEMQ_USER", "user");
		String password = env("ACTIVEMQ_PASSWORD", "pass");
		String host = env("ACTIVEMQ_HOST", "localhost");
		int port = Integer.parseInt(env("ACTIVEMQ_PORT", "61616"));
		String strRecieveDestination = "submit.authenticate";
		String strSendDestination = "response.authenticate";

		ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory(
				"tcp://" + host + ":" + port);

		connection = factory.createConnection(user, password);
		connection.start();
		Session session = connection.createSession(false,
				Session.AUTO_ACKNOWLEDGE);
		Destination recieveDest = new ActiveMQQueue(strRecieveDestination);
		Destination sendDest = new ActiveMQQueue(strSendDestination);

		consumer = session.createConsumer(recieveDest);
		producer = session.createProducer(sendDest);

	}
	
	public void terminate() throws JMSException {
		connection.close();
	}

	/**
	 * Start the server
	 * 
	 * @return
	 */
	public int start() {

		while (!bExit) {
			doMessageLoop();
		}

		return 0;
	}

	/**
	 * The main message pump
	 */
	private void doMessageLoop() {

		System.out.println("Waiting for messages...");
		while (true) {
			Message msg;
			try {
				msg = consumer.receive();
				String body = "{}";
				if (msg instanceof TextMessage) {
					body = ((TextMessage) msg).getText();
				} else if (msg instanceof BytesMessage) {
					BytesMessage bm = (BytesMessage) msg;
					byte[] bytes = new byte[(int) (bm.getBodyLength())];
					bm.readBytes(bytes, bytes.length);
					body = new String(bytes);
				} else {
					System.out.println("Unexpected message type: "
							+ msg.getClass());
					ActiveMQTextMessage errorReply = new ActiveMQTextMessage();
					errorReply.setText("{ 'error':'wrong message type'}");
					producer.send(errorReply);
					continue;
				}
				logger.debug("Message Arrived, correlationid: " + msg.getJMSCorrelationID() + " body: " + body);
				JSONObject request = new JSONObject(body);
				JSONObject response = onMessage(request);
				ActiveMQTextMessage reply = new ActiveMQTextMessage();
				reply.setText(response.toString());
				reply.setJMSCorrelationID(msg.getJMSCorrelationID());
				producer.send(reply);
			} catch (JMSException e) {
				logger.error("Exception from activeMQ", e);
			}
		}
	}
	/**
	 * Main on Message entry point, allows for the flexibility to make this a callback
	 * @param request
	 * @throws JMSException
	 */
	public JSONObject onMessage(JSONObject request) {
		RequestHandler handler = requestHandlerFactory.createRequest(request);
		JSONObject response;
		try {
			response = handler.onMessage();
		} catch (JSONException e) {
			logger.warn("Exception handling message", e);
			response = new JSONObject();
			response.put("status", "exception");
			response.put("exception", e.getMessage());
		}
		return response;
	}

	private static String env(String key, String defaultValue) {
		String rc = System.getenv(key);
		if (rc == null)
			return defaultValue;
		return rc;
	}

	public SingleRequestHandlerFactory getRequestHandlerFactory() {
		return requestHandlerFactory;
	}

	public void setRequestHandlerFactory(
			SingleRequestHandlerFactory requestHandlerFactory) {
		this.requestHandlerFactory = requestHandlerFactory;
	}

}
