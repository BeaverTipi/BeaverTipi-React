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

function getStatusBadge(s) {
  if (s.isRejected === true && s.signedAt) {
    return (
      <span className="bg-red-700 text-white px-2 py-0.5 rounded-full text-xs">
        거절됨
      </span>
    );
  }

  if (s.isSigned === true && s.signedAt) {
    if (s.isValid === true) {
      return (
        <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
          정상
        </span>
      );
    }
    if (s.isValid === false) {
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

  if (s.isJoined === true && s.ipAddr) {
    return <span className="text-sky-400 font-medium text-xs">🔵 접속 중</span>;
  }

  if (!s.isJoined) {
    return <span className="text-gray-400 text-xs italic">⚫ 접속 안됨</span>;
  }

  return <span className="text-yellow-400 text-xs italic">🕓 대기 중</span>;
}

function SignatureStatusBoard({ signers, signature, contId }) {
  console.log("---<><><><><^0^^0^ signers \n", signers);
  const lessorInfo = signers.LESSOR;
  const lesseeInfo = signers.LESSEE;
  const agentInfo = signers.AGENT;

  return (
    <>
      <div className="space-y-3">
        <div
          id={`${contId}-${lessorInfo.role}-${lessorInfo.telno || lessorInfo.code || lessorInfo.id || lessorInfo.name}`}
          className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getInitials(lessorInfo.name?.trim())}
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">{lessorInfo.name}</div>
              <div className="text-xs text-gray-300">
                {roleKorMap[lessorInfo.role] || lessorInfo.role}
              </div>
            </div>
          </div>

          {/* Right: Time + Status */}
          <div className="flex flex-col items-end gap-1">
            {lessorInfo.signedAt ? (
              <span className="text-xs text-gray-400" title={lessorInfo.signedAt}>
                {new Date(lessorInfo.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">미서명</span>
            )}
            {getStatusBadge(lessorInfo)}
          </div>
        </div>

        <div
          id={`${contId}-${lesseeInfo.role}-${lesseeInfo.telno || lesseeInfo.code || lesseeInfo.id || lesseeInfo.name}`}
          className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getInitials(lesseeInfo.name?.trim())}
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">{lesseeInfo.name}</div>
              <div className="text-xs text-gray-300">
                {roleKorMap[lesseeInfo.role] || lesseeInfo.role}
              </div>
            </div>
          </div>

          {/* Right: Time + Status */}
          <div className="flex flex-col items-end gap-1">
            {lesseeInfo.signedAt ? (
              <span className="text-xs text-gray-400" title={lesseeInfo.signedAt}>
                {new Date(lesseeInfo.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">미서명</span>
            )}
            {getStatusBadge(lesseeInfo)}
          </div>
        </div>

        <div
          id={`${contId}-${agentInfo.role}-${agentInfo.telno || agentInfo.code || agentInfo.id || agentInfo.name}`}
          className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getInitials(agentInfo.name?.trim())}
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">{agentInfo.name}</div>
              <div className="text-xs text-gray-300">
                {roleKorMap[agentInfo.role] || agentInfo.role}
              </div>
            </div>
          </div>

          {/* Right: Time + Status */}
          <div className="flex flex-col items-end gap-1">
            {agentInfo.signedAt ? (
              <span className="text-xs text-gray-400" title={agentInfo.signedAt}>
                {new Date(agentInfo.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">미서명</span>
            )}
            {getStatusBadge(agentInfo)}
          </div>
        </div>

      </div>
    </>
  );
}

export default SignatureStatusBoard;
