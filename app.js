const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {addUser,removeUser,getUser,getUsersInRoom} = require(__dirname + "/users.js");
app.use(express.static("public"));
let msg = "Welcome to the chatapp!";
io.on("connection", function(socket) {
  console.log("new Web connection");

  socket.on("join",function(username,room,callback){
    const {user,error}=addUser({id:socket.id,username,room});
    if(error){
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", {
      message: msg,
      createdAt: new Date().getTime()
    });
    const userJoin=user.username+" has joined the chat!";
    socket.broadcast.to(user.room).emit("message", {
      message: userJoin,
      createdAt: new Date().getTime()
    });
    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    });
  })
  socket.on("sendMessage", function(msg, callback) {
    const user=getUser(socket.id);
    io.to(user.room).emit("message", {
      username:user.username,
      message: msg,
      createdAt: new Date().getTime()
    });
    callback();
  });
  socket.on("sendPos", function(pos, callback) {
    const user=getUser(socket.id);
    var msg = "https://www.google.com/maps/?q=" + pos.latitude + "," + pos.longitude;
    io.to(user.room).emit("locationMessage", {
      username:user.username,
      message:msg,
      createdAt:new Date().getTime()
    });
    callback();
  });
  socket.on("disconnect", function() {
    const user=removeUser(socket.id);
    if(user){
      io.to(user.room).emit("message", {
        message: user.username+" has left the chat!",
        createdAt: new Date().getTime()
      });
      io.to(user.room).emit("roomData",{
        room:user.room,
        users:getUsersInRoom(user.room)
      });
    }

  })

})
server.listen(process.env.PORT|| 3000, function() {
  console.log("Server is blessed");
})
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
})
