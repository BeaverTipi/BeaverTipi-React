// import React, { useEffect, useRef, useState } from "react";


// const PROTOCOL = window.location.protocol === "https:" ? "wss" : "ws";
// const HOSTNAME = "dev1.beavertipi.com"; // 서버 주소
// const CONT_ID = "CN250724001"; // 테스트용 계약 ID
// const ROLE = prompt("ROLE을 입력하세요 (LESSEE / LESSOR / AGENT):") || "AGENT";

// export default function SampleWebSocketChat() {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const wsRef = useRef(null);

//   useEffect(() => {
//     const ws = new WebSocket(`${PROTOCOL}://${HOSTNAME}/ws/signers?contId=${CONT_ID}&role=${ROLE}`);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("[WS] 연결됨");
//     };

//     ws.onmessage = (event) => {
//       const [type, contId, role, payloadStr] = event.data.split(/:(.+)/)[1]
//         ? splitWithLimit(event.data, ":", 3)
//         : [null, null, null, "{}"];

//       try {
//         const payload = JSON.parse(payloadStr);
//         if (type === "CHAT") {
//           setMessages((prev) => [...prev, `${role}: ${payload.text}`]);
//         }
//       } catch (e) {
//         console.warn("메시지 파싱 실패:", event.data);
//       }
//     };

//     ws.onclose = () => console.log("[WS] 연결 종료");
//     ws.onerror = (err) => console.error("[WS] 에러:", err);

//     return () => ws.close();
//   }, []);

//   const splitWithLimit = (str, delimiter, limit) => {
//     const parts = str.split(delimiter);
//     const head = parts.slice(0, limit);
//     const tail = parts.slice(limit).join(delimiter);
//     return [...head, tail];
//   };

//   const sendMessage = () => {
//     if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
//       console.warn("웹소켓이 연결되지 않았습니다.");
//       return;
//     }

//     const payload = { text: message };
//     const msg = `CHAT:${CONT_ID}:${ROLE}:${JSON.stringify(payload)}`;
//     wsRef.current.send(msg);
//     setMessage(""); // 입력창 초기화
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>WebSocket 테스트 (계정: {ROLE})</h2>
//       <textarea
//         rows="4"
//         cols="50"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <br />
//       <button onClick={sendMessage}>저장</button>
//       <div
//         id="canvas"
//         style={{
//           marginTop: "20px",
//           padding: "10px",
//           border: "1px solid gray",
//           minHeight: "150px",
//         }}
//       >
//         {messages.map((msg, idx) => (
//           <div key={idx}>{msg}</div>
//         ))}
//       </div>
//     </div>
//   );
// }
