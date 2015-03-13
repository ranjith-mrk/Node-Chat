var optimizer = require('../index.js');
var test_array = ["The","array","should","be","covered"];

describe('forEach', function(){
    it('it should loop array and do the callback', function(){
        try{
            optimizer.utils.forEach(test_array,function(item){
                console.log(item);
            },null);  
        }
        catch(e){
            throw e;
        }
    });
});

describe('forEachReturn', function(){
    it('it should loop array and do the callback adn returncallback at end', function(){
        try{
            optimizer.utils.forEachReturn(test_array,function(item){
                console.log(item);
            },function(){
                console.log('The return callback has been called ');
            },null);
        }
        catch(e){
            throw e;
        }
    });
});
    