var fs = require('fs');


var rope = require('./rope');
var document_util = require('./utility');


function State (dId, doc_Path) {
	this.dId = dId;
	this.doc_Path = doc_Path;
	
	//initialize necessary data-structures
	this.transformedOperations = [];
	this.localOperations = [];
	this.operationsNotSaved = [];

	//fixes \r\n issue in windows
	var fileContent = document_util.fixEOL(fs.readFileSync(doc_Path).toString());

	//initialize the docState
	this.docState = rope(fileContent);
	
	// write state to the file every 2 minute interval
	var THRESHOLD_TIME_MILLISECONDS = 12000; 
	//create an Interval-Object	
	var self = this;
	this.interval = setInterval(
		function(doc_Path, docState) {
			//console.log(doc_Path, docState);
			fs.writeFile(doc_Path, docState, function(err) {
				if(err) {console.log(err);}
			});
			self.operationsNotSaved = []; // clears operationsNotSaved
		}, THRESHOLD_TIME_MILLISECONDS, this.doc_Path, this.docState
	);
}


State.prototype.getSynStamp = function() {
	return this.transformedOperations.length; 
};


State.prototype.getState = function() {
	return this.docState.toString();
};


State.prototype.applyToRope = function(operation) {
	if (operation.type === 'INSERT') {
		if (operation.position < 0 || operation.position > this.docState.length) {
			console.log('Invalid Insert Operation at ' + operation.position + ' ' + operation.charToInsert);
		} else {
			this.docState.insert(operation.position, operation.charToInsert);
		}
	} else if (operation.type === 'ERASE'){
		if (operation.position < 0 || operation.position >= this.docState.length) {
			console.log('Invalid Erase Operation at ' + operation.position);
		} else {
			this.docState.remove(operation.position, operation.position+1);
		}
	} else {
		console.log('Operation is undefined');
	}
};

//writes docState to file and stops the periodic write-callback from execution
State.prototype.cleanup = function() {
	clearInterval(this.interval);

	//write docState to the file Doc#dId
	fs.writeFile(this.doc_Path, this.docState, function(err) {
		if(err !== undefined) {
			console.log(err);
		}
	});
	//stops the write-callback from execution
	document_util.log("Clean-up Status", 'done');
};

//Lets export
if (typeof this === 'object') this.State = State;
