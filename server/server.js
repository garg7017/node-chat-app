
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

var port = process.env.PORT || 3000;
var publicPath = path.join(__dirname,'../public');
const {generateMessage,generateLocationMessage} = require('./utils/message.js');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));


io.on('connection',(socket) => {
	// console.log('New User connected');

	

	socket.on('join',(params,callback) => {
		if(!isRealString(params.name) || !isRealString(params.room)){
			return callback('Name and room name are required.')
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id,params.name,params.room);

		io.to(params.room).emit('updateUserList',users.getUserList(params.room));
		socket.emit('newMessage',generateMessage('Admin','Welcome to the chat App'));
		socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined the room.`));

		callback();
	});


	socket.on('createMessage',(message,callback) =>{
		// console.log('Create message',message);

		var user = users.getUser(socket.id);
		if(user && isRealString(message.text)){
			io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
		}

		// io.emit('newMessage',{
		// 	from:message.from,
		// 	text:message.text,
		// 	createAt:new Date().getTime()
		// });
		// callback('This message is from server');
		// socket.broadcast.emit('newMessage',generateMessage(message.from,message.text));
	});


	socket.on('createLocationMessage',(coords) => {
		var user = users.getUser(socket.id);
		if(user){
			io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude, coords.longitude));
		}
		// io.emit('newLocationMessage',generateLocationMessage('Admin',coords.latitude, coords.longitude));
	});



	socket.on('disconnect',() =>{
		// console.log('User was disconnected');
		var user = users.removeUser(socket.id);

		if(user){
			io.to(user.room).emit('updateUserList',users.getUserList(user.room));
			io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the room.`));
		}

	});

});

server.listen(port,() => {
	console.log(`Server is up at ${port}`);
});

console.log(publicPath);