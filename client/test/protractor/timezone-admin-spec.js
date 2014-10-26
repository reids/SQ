var request = require("superagent");

describe('TopTalApp timezone list', function() {
	var inputEmail = element(by.model('user.email'));
	var inputPassword = element(by.model('user.password'));
	var btnLogin = element(by.buttonText('Log in'));
	var btnLogout = element(by.buttonText('Log out'));
	var btnSignin = element(by.buttonText('Sign in'));
	var btnNew = element(by.buttonText('New Time Zone'));
	var timezonelist = element.all(by.repeater('timezone in timezones'));
	
	beforeEach(function() {
		console.log('login');
		browser.get('http://localhost:9080');
		btnLogin.click();
		inputEmail.sendKeys('test@testing.com');
		inputPassword.sendKeys('test');
		btnSignin.click();
		console.log('sign in clicked');
		browser.waitForAngular(); 
	});
	  
	afterEach(function() {
		console.log('logout');
		btnLogout.click();
		console.log('logout clicked');
		browser.waitForAngular(); 
	});
	  
    it('should display an empty list of timezones', function() {
    	expect(timezonelist.count()).toEqual(0);
    });
    
    it('should display the admin timezones page and add timezones', function() {
    	
		browser.get('http://localhost:9080/admin/timezones');
    	expect(timezonelist.count()).toEqual(0);    	
		btnNew.click();

		var inputName = element(by.model('timezone.name'));
		var inputCity = element(by.model('timezone.city'));
		var inputOffset = element(by.model('timezone.offset'));
		var btnSave = element(by.buttonText('Save'));
		var btnRemove = element(by.buttonText('Remove'));
		var btnRevert = element(by.buttonText('Revert changes'));
		
		inputName.sendKeys('GMT');	
		inputCity.sendKeys('London');	
		inputOffset.sendKeys('0');	
        btnSave.click();
        
    	expect(timezonelist.count()).toEqual(1);    	

		btnNew.click();
		inputName.sendKeys('Swiss');
		inputCity.sendKeys('Zürich');	
		inputOffset.sendKeys('2');	
        btnSave.click();
        
    	expect(timezonelist.count()).toEqual(2);    	

		btnNew.click();
		inputName.sendKeys('Iran');	
		inputCity.sendKeys('Tehran');	
		inputOffset.sendKeys('4.5');	
        btnSave.click();
        
    	expect(timezonelist.count()).toEqual(3);    	
    	
    	// load a timezone into the edit page
    	element(by.repeater('timezone in timezones').row(0)).click();
    	
    	// Check the correct timezone was loaded
		expect(inputName.getAttribute('value')).toEqual('GMT');	
    	
    	// remove it
    	btnRemove.click();
    	
       	var firstTzName = element(by.repeater('timezone in timezones').row(0).column('{{timezone.name}}'));
       	expect(firstTzName.getText()).toEqual('Swiss');
       	
    	// edit a timezone
    	element(by.repeater('timezone in timezones').row(1)).click();
		inputCity.sendKeys('Update');	
        btnSave.click();
    	
       	var firstTzCity = element(by.repeater('timezone in timezones').row(1).column('{{timezone.city}}'));
       	expect(firstTzCity.getText()).toEqual('TehranUpdate');
       	
    	// edit a timezone and revert changes
    	element(by.repeater('timezone in timezones').row(1)).click();
		inputCity.sendKeys('Update');	// changes it to TehranUpdateUpdate
        btnRevert.click().then(function() {
        	expect(inputCity.getAttribute('value')).toEqual('TehranUpdate');	
        });
       	
    });

    it('should reset the created timezones', function() {
    	var testuserid;
    	
        request
    		.get('https://api.mongolab.com/api/1/databases/mongogb1/collections/users?apiKey=M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE&q=%7B%22email%22%3A%22test@testing.com%22%7D')
    		.end(function(error, res) {
    			console.log(res.body);
    			testuserid= res.body[0]._id.$oid;
    			console.log('Deleting timezones for user ' + testuserid);
    			
    			request
    			.put('https://api.mongolab.com/api/1/databases/mongogb1/collections/timezones?apiKey=M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE&q=%7B%22user_id%22%3A%22' + testuserid + '%22%7D')
    			.send( [] )
    			.end(function(error, res) {
    				console.log(res.body);
    			});
    		});
    });
});