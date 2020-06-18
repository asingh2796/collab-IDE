
var document_state = require('./state');
var document_util = require('./utility');
var operationalTransform = require('./OT');


function Session(dId, doc_Path) {
	this.state = new document_state.State(dId, doc_Path);
	this.userCursorPos = {};
	this.userSynTime = {};
}


Session.prototype.addUser = function(uId) {
	this.userSynTime[uId] = this.state.getSynStamp();
	this.userCursorPos[uId] = 0;
};



Session.prototype.removeUser = function(uId) {
	try {
		if (uId in this.userSynTime && uId in this.userCursorPos) {
			delete this.userSynTime[uId];
			delete this.userCursorPos[uId];
		} else {
			//uId not found exception
			throw {
				msg: 'Cant remove user#' + uId + " . UserId doesn't exist."
			}; 
		}
	} catch (err) {
		console.log(err);
	}
};


Session.prototype.handlePush = function(request, response, uId) {
	//state of Doc#dId
	var state = this.state;
	var userCursorPos = this.userCursorPos;
	//bulk PUSH request received from User#uId
	var operationsRecvd = request.body;
	
	operationsRecvd.forEach( function(operation) {
		
		//trnsfrm the operation
		var transformed = operationalTransform.trnsfrm(operation, state.localOperations);
		
		//set the synTimeStamp of the transformed
		var synTimeStamp = state.getSynStamp();
		transformed.synTimeStamp = synTimeStamp;
		
		//perform the necessary editing 
		if (transformed.type === 'REPOSITION') {
			userCursorPos[uId] = transformed.position;
		} else {	
			//update transformedOperations to notify users of state-changes 
			state.transformedOperations.push(transformed);
			
			//clone and push the operation for transformation
			var cloned = JSON.parse(JSON.stringify(transformed));
			state.localOperations.push(cloned);

			//update the server state of the doc
			state.applyToRope(transformed);
			state.operationsNotSaved.push(transformed);

			document_util.log('PUSH', operation);
			document_util.log('TRANSFORMED', operation);
			document_util.log('STATE', state.getState());
		}
	});
};


Session.prototype.handleGet = function(request, response, uId) {
	
	var getOperation = request.body;
	var prevTimeStamp = this.userSynTime[uId];
	var currentTimeStamp = 0; 
	
	//editing done by other users since the users last pulled state from server
	var changesToSync = [];
	var size = this.state.transformedOperations.length;
	
	const GET_THRESHHOLD = 10;
	for (var i = prevTimeStamp; i < size && changesToSync.length < GET_THRESHHOLD; i++) {
		var operation = this.state.transformedOperations[i];
		changesToSync.push(operation);
		currentTimeStamp = operation.synTimeStamp + 1;
	}
	
	if (changesToSync.length > 0) {
		//send changes not yet synced
		this.userSynTime[uId] = currentTimeStamp;
		response.json(changesToSync);
	} else {
		//if no operations to be pushed, update the client about client position on doc
		var repositionOperations = [];
		for (var user in this.userCursorPos) {
			console.log(user);
			repositionOperations.push(
				{
					type: 'REPOSITION',
					username: user,
					uId: user,
					synTimeStamp: this.state.getSynStamp(), 
					position: this.userCursorPos[user]
				}
			);
		}
		response.json(repositionOperations);
	}
};


Session.prototype.cleanup = function() {
	this.state.cleanup();
};

Session.prototype.getUserCount = function() {
	var userCursorPos = this.userCursorPos;
	var count = 0;
	for (var key in userCursorPos) {
		if (userCursorPos.hasOwnProperty(key)) {
			count++;
		}
	}
	return count;
};

//Lets export
if (typeof this === 'object') this.Session = Session;
