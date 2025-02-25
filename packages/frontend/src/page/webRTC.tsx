import React, { useEffect, useState } from "react";

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "turn:turn.anyfirewall.com:443?transport=tcp",
    credential: "webrtc",
    username: "webrtc",
  },
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

// WebSocket signaling server URL
const WS_SERVER_URL = "ws://webrtcchatbackend.vercel.app";

const WebRTCChat: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    // Create WebSocket connection
    const websocket = new WebSocket(WS_SERVER_URL);
    setWs(websocket);

    // Create WebRTC Peer Connection
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Create a Data Channel for messaging
    const channel = pc.createDataChannel("chat");
    setDataChannel(channel);

    // Handle incoming messages
    channel.onmessage = async (event) => {
      const data= event.data
      setChat((prevChat) => [...prevChat, `Peer: ${data}`]);
    };

    websocket.onopen = () => console.log("Connected to WebSocket Server");

    websocket.onmessage = async (event) => {
      
      const data = JSON.parse( await event.data.text());

      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        websocket.send(JSON.stringify({ type: "answer", answer }));
      } else if (data.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.type === "ice-candidate" && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };

    pc.ondatachannel = (event) => {
      event.channel.onmessage = (e) => {
        setChat((prevChat) => [...prevChat, `Peer: ${e.data}`]);
      };
      setDataChannel(event.channel);
    };

    setPeerConnection(pc);

    return () => {
      websocket.close();
      pc.close();
    };
  }, []);

  const startConnection = async () => {
    if (!peerConnection || !ws) return;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: "offer", offer }));
  };

  const sendMessage = () => {
    if (dataChannel && message.trim() !== "") {
      dataChannel.send(message);
      setChat((prevChat) => [...prevChat, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div>
      <h2>WebRTC P2P Chat (WebSocket)</h2>
      <button onClick={startConnection}>Start Chat</button>
      <div style={{ border: "1px solid #ddd", padding: "10px", height: "200px", overflowY: "scroll" }}>
        {chat.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input 
        type="text" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type a message..." 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default WebRTCChat;
