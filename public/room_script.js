
const disconnect = ()=>{
  document.location= `https://privatevideochatbackend.herokuapp.com/`
}

const connectToNewUser= (userId, myStream)=> {
  const call = myPeer.call(userId, myStream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}



const addVideoStream = (video, stream)=> {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Turn Off Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Turn On Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}










const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    
    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})



socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})



  
  let text = $("input");
  //press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });

  
let chats_id = localStorage.getItem('meet_id');
let chats = localStorage.getItem("meet_chats");

if(!chats_id){
  chats_id = ROOM_ID;
}
else if(chats_id != ROOM_ID){
  localStorage.setItem('meet_chats',[]);
}
else{
    
  if(!chats){
    localStorage.setItem("meet_chats",[]);
    chats = [];
  }
  else{
    chats = chats.split(',');
    for(let i=0; i<chats.length; i++){
      $("ul").append(`<li class="message"><b>user</b><br/>${chats[i]}</li>`);
    }
    scrollToBottom()
  }

}

localStorage.setItem('meet_id',ROOM_ID);


socket.on("createMessage", message => {
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
  
  chats.push(message);
  localStorage.setItem('meet_chats',chats);
  scrollToBottom()
})
