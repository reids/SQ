var request = require("superagent");

describe('TopTalApp timezone list', function() {
	var inputEmail = element(by.model('user.email'));
	var inputPassword = element(by.model('user.password'));
	var btnLogin = element(by.buttonText('Log in'));
	var btnLogout = element(by.buttonText('Log out'));
	var btnSignin = element(by.buttonText('Sign in'));
	var btnNew = element(by.buttonText('New Time Zone'));
	var timezonelist = element.all(by.repeater('timezone in timezones'));
	
	var testuserid;
	var testtimezoneid;
	var modifiedtimezoneid;
	var deletedtimezoneid;
	var recordcount;
	
    it('should create a user', function() {
    	
    	request
    	.post('http://localhost:9080/api/users/create')
    	.send( {
    		"email" : "z@z.com" , 
    		"password" : "z" , 
    		"firstName" : "z" , 
    		"lastName" : "z"
    	} )
    	.end(function(error, res) {
    		console.log("User Created Result");    		
    		console.log(res.body);
    		testuserid= res.body._id.$oid;
    	});  
    	
    	waits(2000);
    	
    	expect(testuserid).not.toBe(null);

    });
    
    it('should create a timezone for the z@z.com user', function() {
    	
    	request
    	.post('http://localhost:9080/api/timezones/create?email=z@z.com&password=z')
    	.send( {
    	    "name": "GMTnew",
    	    "city": "Londonnew",
    	    "offset": "0"
    	} )
    	.end(function(error, res) {
    		console.log("Timezone Create Result");    		
    		console.log(res.body);
    		testtimezoneid= res.body._id.$oid;
    	});
    	
    	waits(2000);
    	
    	expect(testtimezoneid).not.toBe(null);
    });

    it('should list the timezones for the z@z.com user', function() {
    	
    	request
    	.get('http://localhost:9080/api/timezones/list?email=z@z.com&password=z')
    	.end(function(error, res) {
    		console.log("Timezone List Result");    		
    		console.log(res.body);
    	});
    	
    	waits(2000);    	
    });

    it('should modify a timezone for the z@z.com user', function() {
    	
    	request
    	.put('http://localhost:9080/api/timezones/update?email=z@z.com&password=z&id=' + testtimezoneid)
    	.send( {
    	    "name": "GMTUpdate",
    	    "city": "LondonUpdate",
    	    "offset": "0"
    	} )
    	.end(function(error, res) {
    		console.log("Timezone Update Result");    		
    		console.log(res.body);
    		recordcount= res.body.n;
    		console.log('recordcount=' + recordcount);
    		expect(recordcount).toEqual(1);
    	});
    	
    	waits(2000);
    	
    });
	
    it('should fail to modify a timezone when logged in as the wrong user', function() {
    	
    	request
    	.put('http://localhost:9080/api/timezones/update?email=admin@abc.com&password=changeme&id=' + testtimezoneid)
    	.send( {
    	    "name": "GMTUpdate",
    	    "city": "LondonUpdate",
    	    "offset": "0"
    	} )
    	.end(function(error, res) {
    		console.log("Timezone Invalid Update Result");    		
    		console.log(res.body);
    		recordcount= res.body.n;
    		console.log('recordcount=' + recordcount);
    		expect(recordcount).toEqual(0);
    	});
    	
    	waits(2000);
    	
    });
	
    it('should fail to delete the timezone when logged in as the wrong user', function() {
    	
    	request
    	.del('http://localhost:9080/api/timezones/delete?email=admin@abc.com&password=changeme&id=' + testtimezoneid)
    	.end(function(error, res) {
    		console.log("Timezone Invlaid Delete Result");    		
    		console.log(res.body);
    		recordcount= res.body.removed;
    		expect(recordcount).toEqual(0);
    	});
    	
    	waits(2000);
    	
    });
    
    it('should delete a timezone for the z@z.com user', function() {
    	
    	request
    	.del('http://localhost:9080/api/timezones/delete?email=z@z.com&password=z&id=' + testtimezoneid)
    	.end(function(error, res) {
    		console.log("Timezone Delete Result");    		
    		console.log(res.body);
    		recordcount= res.body.removed;
    		expect(recordcount).toEqual(1);

    	});
    	
    	waits(2000);
    	
    });
    
    it('should delete the user and created timezones', function() {
    	var testuserid;
    	
        request
    		.get('https://api.mongolab.com/api/1/databases/mongogb1/collections/users?apiKey=M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE&q=%7B%22email%22%3A%22z@z.com%22%7D')
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
    				
       			console.log('Deleting user ' + testuserid);
        		request
        			.del('https://api.mongolab.com/api/1/databases/mongogb1/collections/users/' + testuserid + '?apiKey=M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE')
        			.send( [] )
        			.end(function(error, res) {
        				console.log(res.body);
        			});

    		});
        
    });
 });
