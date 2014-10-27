package com.toptal.service;

import com.toptal.model.User;

public interface UserService {

	void persistUser(User user, String password);

	User findUserById(String id);

	void deleteUser(User user);

	boolean isPasswordValid(String user, String string);
}
