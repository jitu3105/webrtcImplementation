const express = require("express");
const socket = require("socket.io");
const cors = require("cors");


const app = express();

app.use(cors("http://localhost:8082"));

app.use(express.static("public"));


const server = app.listen(4000, () => {
  console.log("running on 4000");
});

const io = socket(server,{cors:["http://localhost:8082"]});

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("create", (roomname) => {
    console.log(roomname)
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomname);
   
      socket.join(roomname);
      console.log(roomname)
      socket.emit("created");
      console.log("room created");
    
  });
  socket.on("join", (roomname) => {
    console.log(roomname);
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomname);

   
      socket.join(roomname);
      socket.emit("joined");
      console.log("room joined");
    
  });
  socket.on("ready", (roomname) => {
    console.log("ready");
    console.log(roomname)
    socket.broadcast.to(roomname).emit("ready");
    // io.emit("ready");
  });

  socket.on("candidate", ({ candidate, roomName }) => {
    console.log("candidate");
    socket.broadcast.to(roomName).emit("candidate", candidate);
  });

  socket.on("offer", ({ offer, roomName }) => {
    console.log(offer);

    socket.broadcast.to(roomName).emit("offer", offer);
  });

  socket.on("answer", ({ answer, roomName }) => {
    console.log(answer);

    socket.broadcast.to(roomName).emit("answer", answer);
  });
});
