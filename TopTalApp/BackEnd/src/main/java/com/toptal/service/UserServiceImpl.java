package com.toptal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.toptal.dao.UserDAO;
import com.toptal.model.User;

@Service("userService")
public class UserServiceImpl implements UserService {

	@Autowired
	UserDAO userDAO;
	@Autowired
	PasswordHash passwordHash;
	
	@Override
	@Transactional
	public void persistUser(User user, String password) {
		
		user.setId(user.getId().toLowerCase());
		// Set the hash and the salt
		hashPassword(user, password);
		userDAO.persistUser(user);
		
	}

	@Override
	@Transactional
	public User findUserById(String id) {
		return userDAO.findUserById(id.toLowerCase());
	}

	@Override
	@Transactional
	public void deleteUser(User user) {
		userDAO.deleteUser(user);
		
	}
	/**
	 * Calculates salt and hash and populates User with them
	 * @param user
	 * @param password
	 */
	private void hashPassword(User user, String password) {
		user.setSalt(passwordHash.getSalt());
		user.setHash(passwordHash.getSecurePassword(password, user.getSalt()));
	}

	/**
	 * Test the supplied password
	 */
	@Override
	@Transactional(readOnly=true)
	public boolean isPasswordValid(String userID, String password) {
		// Load the user
		User user = findUserById(userID.toLowerCase());
		if (user == null)
			return false;
		
		String incomingHash = passwordHash.getSecurePassword(password, user.getSalt());
		
		return (incomingHash.equals(user.getHash()));
	}
}
