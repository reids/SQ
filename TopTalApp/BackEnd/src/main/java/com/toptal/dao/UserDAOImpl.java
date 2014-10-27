package com.toptal.dao;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.toptal.model.User;

@Repository("UserDAO")
public class UserDAOImpl implements UserDAO {

	@Autowired
	private SessionFactory sessionFactory;

	/**
	 * WE are not distinguishing between save and update
	 */
	@Override
	public void persistUser(User User) {
		sessionFactory.getCurrentSession().saveOrUpdate(User);
	}

	@Override
	public User findUserById(String id) {
		return (User) sessionFactory.getCurrentSession().get(User.class, id);
	}

	@Override
	public void deleteUser(User User) {
		sessionFactory.getCurrentSession().delete(User);

	}

}