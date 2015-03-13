var app = require('express')();
var amqp = require('amqplib');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var when = require('when');
var socket_redis = require('socket.io-redis');
var util = require('util');
var qname = 'chat_queue';
var history_queue = 'history_queue';
var exchange_name = 'chat_exchange';
var rabbit_connection;
var history_connection;
http.listen(3001, function(){
  console.log('listening on *:3001');
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


function init(){
	amqp.connect("amqp://guest:guest@localhost:5672").then(function(conn){
		return when(conn.createChannel().then(function(ch){
			var ok = ch.assertExchange(exchange_name, 'topic', {durable : false, autoDelete : false});
			ok = ok.then(function(){
				return ch.assertQueue(qname, {"x-expires": "1800000"});
			});

			ok.then(function(qok){
				return ch.bindQueue(qok.queue, exchange_name, '').then(function(){
					return qok.queue;
				});
			});


			return ok.then(function() {
	      rabbit_connection = ch;
			});

		}));
	})
}

function get_chat(){
	amqp.connect("amqp://guest:guest@localhost:5672").then(function(conn){
		return when(conn.createChannel().then(function(ch){
			var ok = ch.assertExchange(exchange_name, 'topic', {durable : false, autoDelete : false});
			ok = ok.then(function(){
				return ch.assertQueue(history_queue, {"x-expires": "1800000"});
			});

			ok.then(function(qok){
				return ch.bindQueue(qok.queue, exchange_name, '').then(function(){
					return qok.queue;
				});
			});


			return ok.then(function() {
	      history_connection = ch;
			});

		}));
	})
}

init();
get_chat();

io.adapter(socket_redis({ "host": "localhost", "port": 6379, "namespace": "chat_connection" }));

io.on('connection', function(socket){
	console.log("A new user connection");
	socket.emit("connection_established", {'action' : 'connect'})
  socket.on('chat message', function(data){
    io.to(data['room_id']).emit('chat message', data);
    rabbit_connection.sendToQueue(qname, new Buffer(JSON.stringify(data)));
  });

  socket.on('join_room', function(room_id){
  	socket.join(room_id);
  	socket.emit("joined_room", socket.id)
  });

  socket.on('get_previous_chat', function(data){
  	console.log("Get previous history request");
  	history_connection.sendToQueue(history_queue, new Buffer(JSON.stringify(data)));
  })


	socket.on('disconnect', function(){
  	console.log('user disconnected');
	});
});


