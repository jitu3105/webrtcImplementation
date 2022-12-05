var socket = io.connect("http://localhost:4000");
var divVideoChatLobby = document.getElementById("video-chat-lobby");
var divVideoChatRoom = document.getElementById("video-chat-room");
var joinButton = document.getElementById("join");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
var roomInput = document.getElementById("roomName");
var roomName = roomInput.value;
var userStream;
// var peerStream;
var creator = false;

var rtcPeerConnection;

var iceServers = {
  iceServers: [
    {
      urls: "stun:stun.services.mozilla.com",
    },
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

joinButton.addEventListener("click", () => {
  if (roomInput.value == "") {
    alert("please enter room name ");
    return;
  }
  console.log(roomInput.value);
  socket.emit("join", roomInput.value);
});

socket.on("created", async () => {
  creator = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 800, height: 720 },
    });
    console.log(stream)
    userStream = stream;
    divVideoChatLobby.style.display = "none";
    console.log(userVideo);
    console.log(stream);
    userVideo.muted = true;
    userVideo.srcObject = stream;
    userVideo.onloadedmetadata = (e) => {
      userVideo.play();
    };
    socket.emit("ready", roomName);
  } catch (err) {
    console.log(err);
  }
});
socket.on("joined", async () => {
  creator = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 800, height: 720 },
    });
    userStream = stream;

    divVideoChatLobby.style.display = "none";
    console.log(userVideo);
    console.log(stream);
    userVideo.srcObject = stream;
    userVideo.onloadedmetadata = (e) => {
      userVideo.play();
    };

    socket.emit("ready", roomName);
  } catch (err) {
    console.log(err);
  }
});
socket.on("full", () => {
  alert("hey room is full try again later");
});
socket.on("ready", () => {
  if (creator) {
    // alert("heheh");
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.createOffer(
      (offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", { offer, roomName });
      },
      (err) => {
        console.log(err);
      }
    );
  }
});

socket.on("candidate", (candidate) => {
  var iceCandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(iceCandidate);
});

socket.on("offer", (offer) => {
  console.log(creator);
  if (!creator) {
    // alert("heheh");
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection.createAnswer(
      (answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", { answer, roomName });
      },
      (err) => {
        console.log(err);
      }
    );
  }
});
socket.on("answer", (answer) => {
  rtcPeerConnection.setRemoteDescription(answer);
});

const onIceCandidateFunction = (event) => {
  if (event.candidate) {
    socket.emit("candidate", { roomName, candidate: event.candidate });
  }
};

const onTrackFunction = (event) => {
  console.log(peerVideo);
  console.log(event);
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = (e) => {
    peerVideo.play();
    a;
  };
};
