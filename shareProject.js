var mongoose = require('mongoose');

var Schema  = mongoose.Schema;

var sharedProjSchema = new Schema({
    uId: String,
    path: String,
    name: String,
    type: String
});

var notification = require('./notification');
var sharedProject = mongoose.model('sharedProject', sharedProjSchema);
var auth = require('./auth');

module.exports = {
    getSharedProjects: function(req, res, uId){
        sharedProject.find({uId: uId}, function(err, projects){
            res.write(JSON.stringify(projects), function(err){
                res.end();
            });
        });
    },

    share: function(req, res, project, userWhoShared, userSharedWith){
        //Resolve project in projectPath and projectName
        var projectName = '';
        var projectPath = '.';
        var level = 0;
        for(var i = 0; i < project.length; ++i){
            if(project.charAt(i) === '.'){
                level++;
            } else if(level === 1){
                projectPath += project.charAt(i);
            } else if(level === 2){
                projectName += project.charAt(i);
            }
        }
        //

        auth.user.find({uId: userWhoShared}, function(err, users) {
            users.forEach(function (entry) {
                new sharedProject({
                    uId: userSharedWith,
                    path: projectPath,
                    name: projectName,
                    type: 'COLLECTION'
                }).save(function (err, data) {
                    notification.addNewNotification(req, res, entry, projectPath, projectName, userSharedWith);
                });
            });
        });
    }
};

function getSharedProjects(req, res){
    sharedProject.find({uId: req.body.uId}, function(err, result){
        res.write(result, function(err){
            res.end();
        });
    });
}