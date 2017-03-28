var app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http);

http.listen(3000,function(){
  console.log("listening on port 3000");
});

var clients = {};

app.get('/' , function (req, res) {
  res.sendFile(__dirname+"\\index.html");
  });


io.on('connection', function (socket) {
  console.log("connected");
  socket.on('add-user', function(data){
    clients[data.username] = {
      "socket": socket.id
    };
  });

  socket.on('private-message', function(data){
    console.log("Sending: " + data.content + " to " + data.username +" from "+ data.sendername);
    if (clients[data.username]){
      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
      io.sockets.connected[clients[data.sendername].socket].emit("add-message", data);
    } else {
      console.log("User does not exist: " + data.username); 
      io.sockets.connected[clients[data.sendername].socket].emit("add-message",{"content":"user_err"});
    }
  });

  //Removing the socket on disconnection
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  })

});



