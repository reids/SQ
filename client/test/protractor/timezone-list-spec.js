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
	  
    it('should display the list of timezones and filter them', function() {

    	// Set up timezones for the test 
		browser.get('http://localhost:9080/admin/timezones');
		var inputName = element(by.model('timezone.name'));
		var inputCity = element(by.model('timezone.city'));
		var inputOffset = element(by.model('timezone.offset'));
		var btnSave = element(by.buttonText('Save'));
		
		btnNew.click();
		inputName.sendKeys('GMT');	
		inputCity.sendKeys('London');	
		inputOffset.sendKeys('0');	
        btnSave.click();
        
		btnNew.click();
		inputName.sendKeys('Iran');	
		inputCity.sendKeys('Tehran');	
		inputOffset.sendKeys('4.5');	
        btnSave.click();
        
		browser.get('http://localhost:9080/timezones');
        
    	expect(timezonelist.count()).toEqual(2);
    	
		var btnFilter = element(by.buttonText('Filter'));
		var inputFilter = element(by.model('filterregexp'));

		inputFilter.sendKeys('G.*');
		btnFilter.click();
		
		expect(timezonelist.count()).toEqual(1);
       	var firstTzName = element(by.repeater('timezone in timezones').row(0).column('{{ timezone.name }}'));
       	expect(firstTzName.getText()).toEqual('GMT');

		inputFilter.clear();
       	inputFilter.sendKeys('.*');
		btnFilter.click();
       	
		expect(timezonelist.count()).toEqual(2);

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