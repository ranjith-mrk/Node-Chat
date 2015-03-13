var amqp = require('amqplib'),
    redis = require('redis'),
    when = require('when'),
    socket_redis = require('socket.io-redis')
var qname = 'chat_queue';
var exchange_name = 'chat_exchange';

function init(){
	amqp.connect("amqp://guest:guest@localhost:5672").then(function(conn){
		return when(conn.createChannel().then(function(ch){
			var ok = ch.assertQueue(qname, {"x-expires": "1800000"});

			ok.then(function(qok){
				return ch.bindQueue(qname, exchange_name, '').then(function(){
					return qname;
				});
			});

			ok = ok.then(function(queue){
				return ch.consume(qname, processMessage, {noAck: true})
			});

			function processMessage(msg){
				var data = JSON.parse(msg.content.toString());
				redis_add(data)
			}
		}));
	})
}

function redis_add(data){
	console.log("Inside redis add function", data);
	redis_client = redis.createClient({ "host": "localhost", "port": 6379, "namespace": "chat_connection" })
	val = redis_client.rpush([data['room_id'], JSON.stringify(data)], function(err, reply){ console.log(reply); });
}


module.exports.init = init;