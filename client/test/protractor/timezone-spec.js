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
    	
//    	var manage= element(by.partialLinkText("Manage"));
//    	manage.click();
		browser.get('http://localhost:9080/admin/timezones');
    	expect(timezonelist.count()).toEqual(0);    	
		btnNew.click();

		var inputName = element(by.model('timezone.name'));
		var inputCity = element(by.model('timezone.city'));
		var inputOffset = element(by.model('timezone.offset'));
		var btnSave = element(by.buttonText('Save'));
		
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
    });

    it('should reset the created timezones', function() {
    	// Hardcoded to ID of test user	54495f5ce4b09b6275a90e8e
    	request
    		.put('https://api.mongolab.com/api/1/databases/mongogb1/collections/timezones?apiKey=M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE&q=%7B%22user_id%22%3A%2254495f5ce4b09b6275a90e8e%22%7D')
    		.send( [] )
    		.end(function(error, res) {
    			console.log(res.body);
    		});
    });
});