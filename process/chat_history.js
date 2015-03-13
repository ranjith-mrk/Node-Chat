var amqp = require('amqplib'),
    redis = require('redis'),
    when = require('when'),
    socket_redis = require('socket.io-redis'),
    redis_client = redis.createClient({ "host": "localhost", "port": 6379, "namespace": "chat_connection" }),
	redis_socket = redis.createClient({ "host": "localhost", "port": 6379, "namespace": "chat_connection" }),
	io = require('socket.io-emitter')(redis_socket);
var qname = 'history_queue';
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
				var data = JSON.parse(msg.content.toString())
				redis_client = redis.createClient({ "host": "localhost", "port": 6379, "namespace": "chat_connection" })
				val = redis_client.lrange([data['room_id'], 0, 100], function(err, reply){ publish_to_redis(data, reply); });
			}
		}));
	})
}

function publish_to_redis(data, history){
	console.log("Inside publish_to_redis function", history);
	io.to(data['room_id']).idEmit('previous_chat',history,data["socket_id"],data["room_id"]);
}


module.exports.init = init;