var app = require('http').createServer(handler),
    amqp = require('amqplib'),
    config = require('../config'),
    io = require('socket.io')(app),
    redis = require('redis'),
    when = require('when'),
    socket_redis = require('socket.io-redis'),
    util = require('util')
var qname = 'chat_queue';
var exchange_name = 'chat_exchange';

function init(){
	amqp.connect("amqp://guest:guest@localhost:5672").then(function(conn){
		return when(conn.createChannel().then(function(ch){
			var ok = ch.assertExchange('exchange_name', 'topic', {durable : false, autoDelete : false});
			ok = ok.then(function(){
				return ch.assertQueue(qname, {"x-expires": "1800000"});
			});

			ok.then(function(qok){
				return ch.bindQueue(qok.queue, exchange_name, '').then(function(){
					return qok.queue;
				});
			});

			ok = ok.then(function(queue){
				return ch.consume(queue, processMessage, {noAck: true})
			});

			function processMessage(msg){
				var data = JSON.parse(msg.content.toString());
				process.stdout.write("hello: ", msg);
			}


			return ok.then(function() {
	      rabbit_connection = ch;
			});

		}));
	})
}


module.exports.init = init;