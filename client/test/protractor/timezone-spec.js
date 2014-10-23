describe('TopTalApp timezone list', function() {
	var inputEmail = element(by.model('user.email'));
	var inputPassword = element(by.model('user.password'));
	var btnLogin = element(by.buttonText('Log in'));
	var btnLogout = element(by.buttonText('Log out'));
	var btnSignin = element(by.buttonText('Sign in'));
	var btnNew = element(by.buttonText('New Time Zone'));
	var timezonelist = element.all(by.repeater('timezone in timezones'));
	
	beforeEach(function() {
//		console.log('login');
//		browser.get('http://localhost:9080');
//		btnLogin.click();
//		inputEmail.sendKeys('test@testing.com');
//		inputPassword.sendKeys('test');
//		btnSignin.click();
//		console.log('sign in clicked');
	});
	  
	afterEach(function() {
// Unable to get this to log out and back in again for every test, don't know why but only one log out works
// the rest give 'the Element is not visible error.
		
//		console.log('logout');
//		btnLogout.click();
//		console.log('logout clicked');
	});
	  
    it('should login', function() {
		console.log('login');
		browser.get('http://localhost:9080');
		btnLogin.click();
		inputEmail.sendKeys('test@testing.com');
		inputPassword.sendKeys('test');
		btnSignin.click();
		console.log('sign in clicked');
    });
    
    it('should display an empty list of timezones', function() {

    	expect(timezonelist.count()).toEqual(0);
  });
    
    it('should display the admin timezones pagea and add timezones', function() {

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

    it('should do nothing', function() {

    	console.log('test3');
    	
  });
});