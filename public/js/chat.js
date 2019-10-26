var socket=io();
document.querySelector("#msg").focus();
const $messages=document.querySelector("#messages");
const messageTemplate=document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;
console.log($newMessage);
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
  const scrollOffset = Math.ceil($messages.scrollTop + visibleHeight);

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
        console.log("scrolling");
    }
};

socket.on("message",function(message){
  const html=Mustache.render(messageTemplate,{
    username:message.username,
    message:message.message,
    createdAt:moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend",html);
  autoscroll();
});
socket.on("locationMessage",function(url){
  const html=Mustache.render(locationTemplate,{
    username:url.username,
    url:url.message,
    createdAt:moment(url.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend",html);
  autoscroll();
});
socket.on("roomData",function(data){
  const html=Mustache.render(sidebarTemplate,{
    room:data.room,
    users:data.users
  });
  document.querySelector("#sidebar").innerHTML=html;
});

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
document.querySelector("#send").setAttribute("disabled","disabled");
  socket.emit("sendMessage",document.querySelector("#msg").value,function(){
    document.querySelector("#send").removeAttribute("disabled");
    document.querySelector("#msg").value="";
    document.querySelector("#msg").focus();
    console.log("message sent");
  });
});
document.querySelector("#shareLocation").addEventListener("click",function(){
  if(!navigator.geolocation){
    return alert("geolocation not supported");
  }

  navigator.geolocation.getCurrentPosition(function(pos){
    socket.emit("sendPos",{
      latitude:pos.coords.latitude,
      longitude:pos.coords.longitude
    },function(){
      console.log("location shared");
        document.querySelector("#msg").focus();
    });
  });
});
socket.emit("join",username,room,function(error){
  if(error){
    alert(error);
    location.href="/";
  }
});
