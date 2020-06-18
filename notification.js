var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var notificationstruc = new Schema({
    value: String,
    projectPath: String,
    type: String,
    projectName: String,
    uId: String
});

var notification = mongoose.model('notification', notificationstruc);

module.exports = {
    addNewNotification: function(req, res, userToShare, projectPath, projectName, userSharedWith){
        new notification({
            value: userToShare.name + " has shared this project with you.",
            projectPath: projectPath,
            type: 'COLLECTION',
            projectName: projectName,
            uId: userSharedWith
        }).save(function(err, data){
            res.end();
        })
    },
    
	getNotifications: function(req, res, uId) {
        notification.find({uId: uId}, function (err, notifications) {
            notifications.forEach(function(entry){
                    res.end(JSON.stringify(
                        [{'project': {'name' : entry.projectName, 'path' : entry.projectPath, 'type' : entry.type}, 'notificationMessage': entry.value}]
                    ));

                    //removes all seen notifications from the database
                    notification.remove({uId: uId}, function(err){
                    });
            });
        });
    },
	
    clearAll: function(req, res, uId){
        notification.remove({uId: uId}, function(err){
            res.write(uId, function(err){
                res.end();
            });
        });
    }
};