package com.toptal.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "USERS")
public class User {

	@Id
	@Column(name = "ID", nullable = false)
	private String id;

	@Column(name = "SALT", nullable = false)
	private String salt;

	@Column(name = "HASH", nullable = false)
	private String hash;
	
	public User() {
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id.toLowerCase();
	}

	public String getSalt() {
		return salt;
	}

	public void setSalt(String name) {
		this.salt = name;
	}

	public String getHash() {
		return hash;
	}

	public void setHash(String age) {
		this.hash = age;
	}

}
