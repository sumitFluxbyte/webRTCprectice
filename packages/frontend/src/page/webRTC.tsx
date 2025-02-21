import React, { useState, useRef } from "react";

const CONFIGURATION: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const App: React.FC = () => {
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const [remoteOffer, setRemoteOffer] = useState("");
  const [remoteAnswer, setRemoteAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(CONFIGURATION);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      }
    };

    peerConnection.current.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      dataChannel.current.onmessage = (e) => {
        setMessages((prev) => [...prev, `Peer: ${e.data}`]);
      };
    };
  };

  const createOffer = async () => {
    createPeerConnection();
    dataChannel.current = peerConnection.current!.createDataChannel("chat");

    dataChannel.current.onmessage = (event) => {
      setMessages((prev) => [...prev, `Peer: ${event.data}`]);
    };

    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);

    setOffer(JSON.stringify(offer));
  };

  const acceptOffer = async () => {
    if (!remoteOffer) return alert("Paste the received offer first");

    createPeerConnection();
    peerConnection.current!.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      dataChannel.current.onmessage = (e) => {
        setMessages((prev) => [...prev, `Peer: ${e.data}`]);
      };
    };

    await peerConnection.current!.setRemoteDescription(JSON.parse(remoteOffer));
    const answer = await peerConnection.current!.createAnswer();
    await peerConnection.current!.setLocalDescription(answer);

    setAnswer(JSON.stringify(answer));
  };

  const acceptAnswer = async () => {
    if (!remoteAnswer) return alert("Paste the received answer first");

    await peerConnection.current!.setRemoteDescription(JSON.parse(remoteAnswer));
    setIsConnected(true);
  };

  const sendMessage = () => {
    if (dataChannel.current && message.trim()) {
      dataChannel.current.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>WebRTC P2P Chat</h1>

      {!isConnected && (
        <>
          <button onClick={createOffer}>Create Offer</button>
          {offer && (
            <div>
              <h3>Share Offer</h3>
              <textarea value={offer} readOnly rows={5} style={{ width: "100%" }} />
            </div>
          )}

          <h3>Paste Received Offer</h3>
          <textarea value={remoteOffer} onChange={(e) => setRemoteOffer(e.target.value)} rows={5} style={{ width: "100%" }} />
          <button onClick={acceptOffer}>Accept Offer</button>

          {answer && (
            <div>
              <h3>Share Answer</h3>
              <textarea value={answer} readOnly rows={5} style={{ width: "100%" }} />
            </div>
          )}

          <h3>Paste Received Answer</h3>
          <textarea value={remoteAnswer} onChange={(e) => setRemoteAnswer(e.target.value)} rows={5} style={{ width: "100%" }} />
          <button onClick={acceptAnswer}>Accept Answer</button>
        </>
      )}

      {isConnected && (
        <div>
          <h3>Chat</h3>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
