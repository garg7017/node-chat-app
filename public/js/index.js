var socket = io();
socket.on('connect',function () {
	console.log("connected to server");

	// socket.emit('createMessage',{
	// 	from: 'Lokesh',
	// 	text: 'Hi',
	// });

});



socket.on('disconnect', function () {
	console.log("Disconnected to server");
});

socket.on('newMessage', function (message) {
	var formattedTime = moment(message.createdAt).format('h:mm a');
	var template = $("#message-template").html();
	var html = Mustache.render(template,{
		text:message.text,
		from: message.from,
		createdAt:formattedTime
	});
	$("#messages").append(html);

	// var li = $('<li></li>');
	// li.text(`${message.from} ${formattedTime}: ${message.text}`);
	// $("#messages").append(li);
});

socket.on('newLocationMessage', function (message) {

	var formattedTime = moment(message.createdAt).format('h:mm a');
	var template = $("#location-message-template").html();
	var html = Mustache.render(template,{
		url:message.url,
		from: message.from,
		createdAt:formattedTime
	});
	$("#messages").append(html);

	// var formattedTime = moment(message.createdAt).format('h:mm a');
	// var li = $('<li></li>');
	// li.text(`${message.from} ${formattedTime}: `);
	// var a = $('<a target="_blank"> My Current Location</a>');
	// a.attr('href',message.url);
	// li.append(a);
	// $("#messages").append(li);
});


// socket.emit('createMessage', {
// 	from: 'frank',
// 	text: 'Hi'
// },function (data) {
// 	console.log('Got it',data);
// });


$("#message-form").on("submit", function(e) {
	e.preventDefault();

	var messageTextBox = $('[name=message]');
	socket.emit('createMessage',{
		from:'User',
		text:messageTextBox.val()
	},function () {
		messageTextBox.val('');
	});
});

// $('document').ready(function() {
// 	if(!navigator.geolocation){
// 		return alert('Geolocation is not supported by your browser');
// 	}

// 	navigator.geolocation.getCurrentPosition(function (position) {
// 		console.log(position);
// 	},function () {
// 		return alert('Unable to fetch location');
// 	});
// });


$("#send-location").on("click",function () {

	if(!navigator.geolocation){
		return alert('Geolocation is not supported by your browser');
	}

	$(this).attr('disabled','disabled').text('Sending Location...');


	navigator.geolocation.getCurrentPosition(function (position) {
		// console.log(position);
		$("#send-location").removeAttr('disabled').text('Send Location');
		socket.emit('createLocationMessage',{
			latitude:position.coords.latitude,
			longitude:position.coords.longitude,
		});
	},function () {
		$("#send-location").removeAttr('disabled').text('Send Location');;
		return alert('Unable to fetch location');
	});

});