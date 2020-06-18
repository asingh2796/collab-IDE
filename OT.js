module.exports = {

    //Compound Operational Transform
    trnsfrm: function(remote, Buffer) {
        for (var i = remote.synTimeStamp; i < Buffer.length; i++) {
            var local = Buffer[i];
            if (local.uId !== remote.uId) {
                var transformedvalue1 = OpTransform(local, remote, false);
                var transformedvalue2 = OpTransform(remote, local, true);
                remote = transformedvalue1;
                Buffer[i] = transformedvalue2;
            }
        }
        return remote;
    }
}

//Simple Operational Transform
function OpTransform(op1, op2, flag) {
    var transformedvalue1 = JSON.parse(JSON.stringify(op2));

    if (op1.type === 'ERASE' && op2.type === 'ERASE') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        }
    } else if (op1.type === 'INSERT' && op2.type === 'INSERT') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        }
    } else if (op1.type === 'INSERT' && op2.type === 'ERASE') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        }
    } else if (op1.type === 'ERASE' && op2.type === 'INSERT') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        }
    } else if (op1.type === 'ERASE' && op2.type === 'REPOSITION') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position - 1;
            }
        }
    } else if (op1.type === 'INSERT' && op2.type === 'REPOSITION') {
        if (flag) {
            if (op1.position < op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        } else {
            if (op1.position <= op2.position) {
                transformedvalue1.position = op2.position + 1;
            }
        }
    }

    return transformedvalue1;
}