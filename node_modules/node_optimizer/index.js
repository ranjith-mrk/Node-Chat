var fast = require('fast.js');

var optimizer = function(){
}

optimizer.prototype.forEach = function(obj, callback, context){
    fast.forEach(obj, callback.bind(context));
};

optimizer.prototype.tryCatch = function(tryblock, catchblock, context){
    try{
        (tryblock.bind(context))();
    }
    catch(e){
        (catchblock.bind(context))(e);
    }
};

optimizer.prototype.forEachReturn = function(obj, callback, returnCallback, context){
    fast.forEach(obj,callback.bind(context));
    (returnCallback.bind(context))();
};

module.exports.utils = new optimizer();