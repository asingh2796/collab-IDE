
var projectManager = require('./projectManager');
var document_ses = require('./session');
var document_util = require('./utility');


var nm_dir = __dirname + '\\UserProjects';


function SessionManager() {
	this.sessions = {};
}

//Creates a new session for Doc#docId, if none exists. Else uses an existing session. Adds the User#userId to the session. 
SessionManager.prototype.handleRegister = function(request, response, uId, dId) {
	try {
		var self = this;
		getDocPath(dId, function(doc_Path) {
			var state;
			try {
				if (self.sessions[dId] === undefined) {
					self.sessions[dId] = new document_ses.Session(dId, doc_Path);
				} else {
					var state = self.sessions[dId].state;
					state.operationsNotSaved.forEach(function(operation) {
						state.applyToRope(operation);
					});
					state.operationsNotSaved = [];
				}
				var session = self.sessions[dId];
				session.addUser(uId);
				state = session.state.getState();
				document_util.log('Registration Status', 'Success');
			} catch (err) {
				console.log(err.stack);
			} finally {
				response.end(state);
			}
		});
	} catch (err) {
		console.log(err.stack);
	} 
};

Manager.prototype.handleUnregister = function(request, response, uId, dId) {
	console.log('Unregister received');
	try {
		if (this.sessions[dId] !== undefined) {
			var session = this.sessions[dId];
			if (session.userCursorPos[uId] !== undefined) {
				document_util.log('Removing', 'in progress');
				session.removeUser(uId);
				document_util.log('Removing', 'done');
				if (session.getUserCount() === 0) {
					session.cleanup();
					delete this.sessions[dId];
				}
			} else {
				throw {
					msg: 'un-register request from non-existent user#' + uId
				}
			}
		} else {
			throw {
				msg: 'un-register request from non-existent doc#' + dId
			};
		}
	} catch (err) {
		console.log(err);
	} finally {
		response.end();
	}
};


 SessionManager.prototype.handleGet = function(request, response, uId, dId) {
	 var self = this;
	 console.log('GET received: ' + uId);
	 try {
		if (this.sessions[dId] === undefined) {
			throw {
				msg: 'Get request for non-existent doc#' + dId
			};
		} else {
			var session = this.sessions[dId];
			if (session.userCursorPos[uId] === undefined) {
				throw {
					msg: 'Get request for non-existent user#' + uId + ' on doc#' + dId
				};
			} else {
				session.handleGet(request, response, uId);
			}
		}
	} catch(err) {
		if (self.sessions[dId] === undefined) {
			//if no session exists, create a new session
			self.handleRegister(request, response, uId, dId);
		} else if (self.sessions[dId].userCursorPos[uId] === undefined){
			//if no user exist on session, ad user to session
			self.handleRegister(request, response, uId, dId);	
		} else {
			console.log(err.stack);
		}
	} finally {
		response.end();
	}
};

SessionManager.prototype.handlePush = function(request, response, uId, dId) {
	var self = this;
	try {
		if (this.sessions[dId] === undefined) {
			throw {
				msg: 'Push request for non-existent doc#' + dId
			};
		} else {
			var session = this.sessions[dId];
			if (session.userCursorPos[uId] === undefined) {
				throw {
					msg: 'Push request for non-existent user#' + uId + ' on doc#' + dId
				};
			} else {
				session.handlePush(request, response, uId);
			}
		}
	} catch(err) {
		if (self.sessions[dId] === undefined) {
			//if no session exists, create a new session
			self.handleRegister(request, response, uId, dId);
		} else if (self.sessions[dId].userCursorPos[uId] === undefined){
			//if no user exist on session, ad user to session
			self.handleRegister(request, response, uId, dId);	
		} else {
			console.log(err.stack);
		}
	} finally {
		response.end();
	}
};			

//Lets export
module.exports.SessionManager = SessionManager;


function getDocPath(dId, callback) {
	projectManager.file.find({fileID: dId}, function(err, data){
		data.forEach(function(entry){
			var resolvedDocPath = nm_dir + resolve(entry.path);
			resolvedDocPath += '\\' + entry.fileName;
			callback(resolvedDocPath);
		});
	});
}


function resolve(filePath) {
    var doc_Path = "";
    for(var i = 0; i < filePath.length; ++i) {
        if (filePath.charAt(i) === '.') {
            doc_Path += '\\';
        } else {
            doc_Path += filePath.charAt(i);
        }
    }
    return doc_Path;
}
