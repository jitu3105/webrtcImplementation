const express = require("express");
const socket = require("socket.io");
const cors = require("cors");


const app = express();

app.use(cors())

app.use(express.static("public"));
const server = app.listen(4000, () => {
  console.log("running on 4000");
});

const io = socket(server,{cors:["*"]});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join", (roomname) => {
    console.log(roomname)
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomname);
    
    if (room === undefined) {
      socket.join(roomname);
      console.log(roomname)
      socket.emit("created");
      console.log("room created");
    } else if (room.size == 1) {
      socket.join(roomname);
      socket.emit("joined");
      console.log("room joined");
    } else {
      socket.emit("full");
      console.log(`room ${roomname} is already full`);
    }
  });
  socket.on("ready", (roomname) => {
    console.log("ready");
    socket.broadcast.to(roomname).emit("ready");
  });

  socket.on("candidate", ({ candidate, roomName }) => {
    console.log("candidate");
    console.log(candidate);
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
