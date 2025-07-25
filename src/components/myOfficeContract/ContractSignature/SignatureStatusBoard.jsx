import React from "react";

const roleKorMap = {
  AGENT: "중개인",
  LESSOR: "임대인",
  LESSEE: "임차인",
};

function getInitials(name) {
  return name?.[0] || "👤";
}

function getStatusBadge(isValid, signedAt) {
  if (!signedAt) {
    return <span className="text-yellow-400">🕓 대기 중</span>;
  }
  if (isValid === true) {
    return <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">정상</span>;
  }
  if (isValid === false) {
    return (
      <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs animate-pulse">
        위조 의심
      </span>
    );
  }
  return null;
}

function SignatureStatusBoard({ signers = [] }) {
  return (
    <div className="space-y-3">
      {signers.map((s) => (
        <div
          key={s.role}
          className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded shadow-sm"
        >
          {/* Left: Avatar + Role + Name */}
          <div className="flex items-center gap-3">
            {/* 🧑 아바타 */}
            <div className="w-9 h-9 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {getInitials(s.name)}
            </div>

            {/* Role + Name */}
            <div className="text-white">
              <div className="text-sm font-semibold">{roleKorMap[s.role] || s.role}</div>
              <div className="text-xs text-gray-300">{s.name}</div>
            </div>
          </div>

          {/* Right: Time + Status */}
          <div className="flex flex-col items-end gap-1">
            {s.signedAt ? (
              <span
                className="text-xs text-gray-400"
                title={s.signedAt} // 🧾 정확한 시각 ISO 표시
              >
                {new Date(s.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">미서명</span>
            )}
            {getStatusBadge(s.isValid, s.signedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SignatureStatusBoard;