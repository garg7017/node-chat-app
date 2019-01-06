
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

var port = process.env.PORT || 3000;
var publicPath = path.join(__dirname,'../public');
const {generateMessage,generateLocationMessage} = require('./utils/message.js');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));


io.on('connection',(socket) => {
	console.log('New User connected');

	socket.emit('newMessage',generateMessage('Admin','Welcome to the chat App'));

	socket.broadcast.emit('newMessage',generateMessage('Admin','New user joined'));



	socket.on('createMessage',(message,callback) =>{
		console.log('Create message',message);
		io.emit('newMessage',{
			from:message.from,
			text:message.text,
			createAt:new Date().getTime()
		});
		callback('This message is from server');
		socket.broadcast.emit('newMessage',generateMessage(message.from,message.text));
	});


	socket.on('createLocationMessage',(coords) => {
		io.emit('newLocationMessage',generateLocationMessage('Admin',coords.latitude, coords.longitude));
	});



	socket.on('disconnect',() =>{
		console.log('User was disconnected');
	});

});

server.listen(port,() => {
	console.log(`Server is up at ${port}`);
});

console.log(publicPath);