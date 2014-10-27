var path = require('path');

module.exports = {
  mongo: {
    dbUrl: 'https://api.mongolab.com/api/1',            // The base url of the MongoLab DB server
    apiKey: 'M6UDE2i1mqi4s2BGZfElj_3o-bpPNTDE',          // MongoLab API key
    dbName: 'mongogb1'                                 // The name of database
  },
//  FIXME, think we can remove all this security section, it was used to create an initial user
  security: {
    dbName: 'mongogb1',                                 // The name of database that contains the security information
    usersCollection: 'users'                            // The name of the collection contains user information
  },
  server: {
    listenPort: 9080,                                   // The port on which the server is to listen (means that the app is at http://localhost:3000 for instance)
    securePort: 9433,                                   // The HTTPS port on which the server is to listen (means that the app is at https://localhost:8433 for instance)
    distFolder: path.resolve(__dirname, '../client/dist'),  // The folder that contains the application files as packaged by grunt
    staticUrl: '/static',                               // Url for static files
    cookieSecret: 'timezone-app'                        // The secret for encrypting the cookie
  }
};