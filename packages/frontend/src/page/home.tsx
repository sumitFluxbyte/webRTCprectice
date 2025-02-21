import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Connect to signaling server

type Message = {
  sender: "You" | "Peer";
  text: string;
};

const Home: React.FC = () => {
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerId, setRemotePeerId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setPeerId(socket.id);
    });

    socket.on("offer", async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      setRemotePeerId(data.from);
      peerConnection.current = createPeerConnection();

      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));

      const answer = await peerConnection.current?.createAnswer();
      if (answer) {
        await peerConnection.current?.setLocalDescription(answer);
        socket.emit("answer", { answer, peerId: data.from });
      }
    });

    socket.on("answer", async (data: { answer: RTCSessionDescriptionInit }) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("ice-candidate", async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  const createPeerConnection = (): RTCPeerConnection => {
    const config: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };
    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && remotePeerId) {
        socket.emit("ice-candidate", { candidate: event.candidate, peerId: remotePeerId });
      }
    };

    pc.ondatachannel = (event) => {
      event.channel.onmessage = (e) => {
        setMessages((prev) => [...prev, { sender: "Peer", text: e.data }]);
      };
    };

    return pc;
  };

  const startCall = async () => {
    peerConnection.current = createPeerConnection();
    dataChannel.current = peerConnection.current.createDataChannel("chat");

    dataChannel.current.onmessage = (e) => {
      setMessages((prev) => [...prev, { sender: "Peer", text: e.data }]);
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    const id = prompt("Enter Peer ID to connect:");
    if (id) {
      setRemotePeerId(id);
      socket.emit("offer", { offer, peerId: id });
    }
  };

  const sendMessage = () => {
    const message = prompt("Enter message:");
    if (message && dataChannel.current) {
      dataChannel.current.send(message);
      setMessages((prev) => [...prev, { sender: "You", text: message }]);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>WebRTC P2P Chat (TypeScript)</h2>
      <p>Your ID: {peerId}</p>
      <button onClick={startCall}>Start Call</button>
      <button onClick={sendMessage} disabled={!dataChannel.current}>Send Message</button>

      <h3>Chat:</h3>
      <div style={{ border: "1px solid black", padding: "10px", minHeight: "100px", width: "300px", margin: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index}><b>{msg.sender}:</b> {msg.text}</p>
        ))}
      </div>
    </div>
  );
};

export default Home;
