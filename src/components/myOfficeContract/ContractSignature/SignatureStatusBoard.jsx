/*
뱃지 클릭 시 서명 이미지, 서명된 PDF 미리보기, 이력 로그 
모든 상태 변화는 reducer -> state.signers 로 송수신
| 조건                          | 표시         |
| --------------------------- | ---------- |
| 본인이 아닌 나머지 2명이 아직 접속 안했을 경우 | `⚫ 접속 안됨`  |
| 한 명은 지금 들어와 있으나 미서명         | `🔵 접속 중`  |
| 본인 포함 서명 완료                 | `✅ 정상`     |
| 위조 감지                       | `🚨 위조 의심` |
| 서명 거절                       | `❌ 거절됨`    |

*/
import React from "react";

const roleKorMap = {
  AGENT: "중개인",
  LESSOR: "임대인",
  LESSEE: "임차인",
};

function getInitials(name) {
  return name?.[0] || "👤";
}

function getStatusBadge(status, isValid, signedAt, isRejected, connected) {
  if (status === "REJECTED" || isRejected) {
    return (
      <span className="bg-red-700 text-white px-2 py-0.5 rounded-full text-xs">
        거절됨
      </span>
    );
  }

  if (status === "SIGNED") {
    if (isValid === true) {
      return (
        <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
          정상
        </span>
      );
    }
    if (isValid === false) {
      return (
        <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs animate-pulse">
          위조 의심
        </span>
      );
    }
    return (
      <span className="bg-green-800 text-white px-2 py-0.5 rounded-full text-xs">
        서명 완료
      </span>
    );
  }

  if (status === "JOINED" && connected) {
    return <span className="text-sky-400 font-medium text-xs">🔵 접속 중</span>;
  }

  if (!connected) {
    return <span className="text-gray-400 text-xs italic">⚫ 접속 안됨</span>;
  }

  return <span className="text-yellow-400 text-xs italic">🕓 대기 중</span>;
}

function SignatureStatusBoard({ signers = [], onPreview, contId }) {
  console.log("---<><><><><^0^^0^ signers \n", signers);
  return (
    <div className="space-y-3">
      {signers.map((s, index) => (
        <div
          key={`${contId}-${s.role}-${
            s.telno || s.code || s.id || s.name || index
          }`}
          className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getInitials(s.name?.trim())}
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="text-xs text-gray-300">
                {roleKorMap[s.role] || s.role}
              </div>
            </div>
          </div>

          {/* Right: Time + Status */}
          <div className="flex flex-col items-end gap-1">
            {s.signedAt ? (
              <span className="text-xs text-gray-400" title={s.signedAt}>
                {new Date(s.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">미서명</span>
            )}
            {getStatusBadge(
              s.status,
              s.isValid,
              s.signedAt,
              s.isRejected,
              s.connected
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SignatureStatusBoard;
