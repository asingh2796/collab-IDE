var path = require('path');
var urlParser = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var queryString = require('querystring');

var ap1 = express();
//bodyParser.json(): parses request-body with header field "Content-type" set to "application/json" to Javascript-Object

ap1.use(bodyParser.json());
ap1.use(bodyParser.urlencoded({extended: false}));
ap1.use(express.static(path.join(__dirname, 'public')));


var nm_dir = __dirname + '\\UserProjects';


var auth = require('./auth');
var projectManager = require('./projectManager');
var notification = require('./notification');
var share = require('./shareProject');
var docHandler = require('./session_manager');


var sessionManager = new docHandler.SessionManager();


mongoose.connect('mongodb://localhost:27017');
var connect = mongoose.connection;

//Document-Editing Request-Handler

ap1.use("/register", function(req, res) {
    var parsedQuery = queryExtract(req.url);

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req, res", req, res);
    sessionManager.handleRegister(req, res, parsedQuery.uId, parsedQuery.dId);
})

ap1.use("/unregister", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    sessionManager.handleUnregister(req, res, parsedQuery.uId, parsedQuery.dId);
})

ap1.use("/get_operation", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req, res", req, res);
    sessionManager.handleGet(req, res, parsedQuery.uId, parsedQuery.dId);
})

ap1.use("/push_operation", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    sessionManager.handlePush(req, res, parsedQuery.uId, parsedQuery.dId);
})

//Doc Creation and Management Request-Handler
ap1.use("/view", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    projectManager.view(req, res, parsedQuery.path);
})

ap1.use("/get_info", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    auth.getInfo(req, res);
})

ap1.use("/add_node", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    projectManager.addNode(req, res, parsedQuery.path);
})

//Authentication Request-Handler

ap1.use("/login", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    auth.logIn(req, res);
})

ap1.use("/signup", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    auth.signUp(req, res);
})

ap1.use("/get_users", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    auth.getUsers(req, res);
})

// Share Project Request-Handler
ap1.use("/share", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req, res", req, res);
    share.share(req, res, parsedQuery.dId, parsedQuery.uId, parsedQuery.shareId);
})

ap1.use("/get_shared_projects", function(req, res) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>req, res", req, res);
    var parsedQuery = queryExtract(req.url);
    share.getSharedProjects(req, res, parsedQuery.uId);
})


ap1.use("/get_notifications", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    notification.getNotifications(req, res, parsedQuery.uId);
})

ap1.use("/clear_notifications", function(req, res) {
    var parsedQuery = queryExtract(req.url);
    notification.clearAll(req, res, parsedQuery.uId);
})


function queryExtract(url) {
    var parsedURL = urlParser.parse(url);
    var query = parsedURL.query;
    var parsedQuery = queryString.parse(query);
    return parsedQuery;
}

module.exports = ap1;
