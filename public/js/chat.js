var socket = io();
socket.on('connect',function () {
	var params = $.deparam(window.location.search);

	socket.emit('join',params, function(err) {
		if(err){
			alert(err);
			window.location.href = '/';
		} else {
			console.log('No error');
		}
	});

});


function scrollToBottom () {
	var messages = $("#messages");
	var newMessage = messages.children("li:last-child");

	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
		// console.log("Should scroll");
		messages.scrollTop(scrollHeight);
	}
}



socket.on('disconnect', function () {
	console.log("Disconnected to server");
});

socket.on('updateUserList', function (users) {
	// console.log("user list", users);
	var ol = $('<ol></ol>');

	users.forEach(function (user) {
		ol.append($('<li></li>').text(user));
	});

	$("#users").html(ol);

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
	scrollToBottom();

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
	scrollToBottom();

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
		text:messageTextBox.val()
	},function () {
		$('[name=message]').val('');
	});
	$('[name=message]').val('');
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