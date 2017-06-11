var session = require('express-session');
var MongoStore = require('connect-mongo')(session); //need to store our session in mongoDB. Creates collection bd.sessions
var mongoose = require('mongoose');
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection}); //class which add or delete sessions from DB. MongoStore takes settings from mongoose
module.exports = sessionStore;