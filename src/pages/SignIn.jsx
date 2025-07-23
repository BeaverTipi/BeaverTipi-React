// SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function SignIn() {
  const navigate = useNavigate();
  const [mbrId, setMbrId] = useState("");
  const [mbrPw, setMbrPw] = useState("");
  const [loginType, setLoginType] = useState("NORMAL");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "/login",
        { mbrId, mbrPw },
        { withCredentials: true }
      );
      if (res.status === 200) {
        navigate("/contract/sign"); // 또는 이전 페이지 복귀
      }
    } catch (err) {
      alert("로그인 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[400px] space-y-6">
        <h2 className="text-2xl font-bold text-center">로그인</h2>

        <div className="flex justify-between gap-2 text-sm text-gray-300">
          {["임대인", "공인중개사", "시스템 관리자", "입주민", "일반회원"].map(
            (label, idx) => (
              <label key={idx} className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="loginType"
                  defaultChecked={label === "일반회원"}
                />
                <span>{label}</span>
              </label>
            )
          )}
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="아이디"
            value={mbrId}
            onChange={(e) => setMbrId(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={mbrPw}
            onChange={(e) => setMbrPw(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded"
        >
          로그인
        </button>

        <div className="text-xs flex justify-between text-gray-400">
          <a href="#">아이디 찾기</a>
          <a href="#">비밀번호 찾기</a>
          <a href="#">회원가입</a>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <button className="bg-white text-gray-900 py-2 rounded hover:bg-gray-100">
            Google 로그인
          </button>
          <button className="bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300">
            카카오 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
