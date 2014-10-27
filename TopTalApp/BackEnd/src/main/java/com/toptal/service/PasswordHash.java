package com.toptal.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;

import org.springframework.stereotype.Service;

@Service("passwordHash")
public class PasswordHash 
{
    
	private final SecureRandom sr;
	private final MessageDigest md;
	
    public PasswordHash() throws NoSuchAlgorithmException, NoSuchProviderException {
    	// Fail fast, fail early
    	sr = SecureRandom.getInstance("SHA1PRNG", "SUN");
    	md = MessageDigest.getInstance("SHA-256");
	}

	public String getSecurePassword(String passwordToHash, String salt)
    {
        String generatedPassword = null;
        // Create MessageDigest instance for MD5
		//Add password bytes to digest
		md.update(salt.getBytes());
		//Get the hash's bytes 
		byte[] bytes = md.digest(passwordToHash.getBytes());
		//This bytes[] has bytes in decimal format;
		//Convert it to hexadecimal format
		StringBuilder sb = new StringBuilder();
		for(int i=0; i< bytes.length ;i++)
		{
		    sb.append(Integer.toString((bytes[i] & 0xff) + 0x100, 16).substring(1));
		}
		//Get complete hashed password in hex format
		generatedPassword = sb.toString();
        return generatedPassword;
    }
     
    //Add salt
    public  String getSalt()
    {
        //Create array for salt
        byte[] salt = new byte[16];
        //Get a random salt
        sr.nextBytes(salt);
        //return salt
        return salt.toString();
    }
}