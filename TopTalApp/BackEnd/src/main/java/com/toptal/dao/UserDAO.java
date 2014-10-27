package com.toptal.dao;

import com.toptal.model.User;

public interface UserDAO {
	
		  void persistUser(User user);
		  
		  User findUserById(String id);
		  
		  void deleteUser(User user);
		  
}
