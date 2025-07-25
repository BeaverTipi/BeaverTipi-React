/*
[React: ProceedingContracts]
  └─ checkSignStatus
  └─ authorize (인가 성공 시)
      └─ encrypt(contId)
      └─ window.location.href = /contract/{encId}

[React: ContractSignature.jsx]
  └─ useParams → decrypt(encId)
  └─ localStorage.getItem(contId)
  └─ render UI (PDF, WS, Sign UI)

signerInfo: {
  mbrId: string;     // DB 식별자
  role: string;      // "LESSOR" | "LESSEE" | "AGENT"
  name: string;      // 성명
  telNo: string;     // 전화번호
  ipAddr: string;    // 접속 IP (인가 시)
  signedAt: string;  // 서명 확인 시점 (초기 null)
}
*/

import React, { useEffect, useReducer, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useSecureAxios } from "../hooks/useSecureAxios";
import { useDomain } from "../hooks/useDomain";
import SignatureCanvas from "../components/myOfficeContract/ContractSignature/SignatureCanvas";
import { useAES256 } from "../hooks/useAES256";
import { useSecureAxiosFactory } from "../hooks/useSecureAxiosFactory";

export default function ContractSignature() {
  const { encryptedContId } = useParams();// 암호화된 ID ← URL 파라미터
  const navigate = useNavigate();
  const location = useLocation();
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");
  const wsRef = useRef(null); // ✅ WebSocket 참조
  const { decryptWithAES256 } = useAES256(); // ← 이게 있는지 확인


  const initialState = {
    contId: location.state?.contId || localStorage.getItem("ACTIVE_SIGN_CONTID") || "",
    loading: true,
    error: null,
    isExpired: false,
    pdfData: null,
    signers: [],            //LESSEE, LESSOR, AGENT
    signatureStatus: null,  //ex) { lessee: 'SIGNED', lessor: 'PENDING', agent: 'SIGNED' }
    signerInfo: null,        //{ role, name, telno}
    signedAt: null,
    hashVal: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { contId, loading, error } = state;

  function reducer(state, action) {
    switch (action.type) {
      case "SET_CONTID":
        return { ...state, contId: action.payload };
      case "SET_LOADING":
        return { ...state, loading: action.payload };
      case "SET_ERROR":
        return { ...state, error: action.payload };
      case "SET_EXPIRED":
        return { ...state, isExpired: action.payload };
      case "SET_PDF_DATA":
        return { ...state, pdfData: action.payload };
      case "SET_SIGNERS":
        return { ...state, signers: action.payload };
      case "SET_SIGNATURE_STATUS":
        return { ...state, signatureStatus: action.payload };
      case "SIGNER_CONNECTED":
        return {
          ...state
          , signers: state.signers.map(s =>
            s.role === action.payload ? { ...s, connected: true } : s
          ),
        };
      case "SET_SIGNER_INFO":
        return { ...state, signerInfo: action.payload };
      case "SET_SIGNED_AT":
        return {
          ...state, signerInfo: { ...state.signerInfo, signedAt: action.payload }
        };
      default:
        return state;
    }
  }

  // ✅ 인가 처리
  useEffect(() => {
    console.log("encryptedContId", encryptedContId)
    if (state.contId && encryptedContId) {
      (async () => {
        try {
          const data = await authAxios.post("authorize", {
            encryptedContId,
            _method: "GET",
          });
          console.log("data", data);
          if (!data.success) {
            Swal.fire("접근 불가", data.message, "info");
            navigate("/signin");
          } else {
            dispatch({ type: "SET_CONTID", payload: data.contId });
            localStorage.setItem("ACTIVE_SIGN_CONTID", data.contId);

            // ✅ signer 정보 설정
            dispatch({
              type: "SET_SIGNER_INFO",
              payload: {
                mbrId: data.mbrId,
                role: data.role,
                name: data.name,
                telNo: data.telNo,
                ipAddr: data.ipAddr,
                signedAt: null,
                hashVal: null,
              },
            });
          }
        } catch (err) {
          dispatch({ type: "SET_ERROR", payload: err });
          Swal.fire("오류", "접근 실패", "error");
          navigate("/");
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      })();
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptedContId]);

  useEffect(() => {
    if (contId) localStorage.setItem("ACTIVE_SIGN_CONTID", contId);
  }, [contId]);


  /*##################################################################################*/
  /** WebSocket Handler **/
  //서명페이지 유효 시간 만료 상태 전파
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:80/ws/contractExpire");
    //    socket.onopen = () => console.log("✅ [SIGNPAGE] WebSocket 연결 성공");

    socket.onmessage = (event) => {
      const msg = event.data;
      if (msg.startsWith("EXPIRED:")) {
        const expiredContId = msg.split(":")[1];

        if (expiredContId === contId) {
          Swal.fire({
            icon: "info",
            title: "서명 만료",
            text: "전자서명의 유효 시간이 만료되었습니다.",
            confirmButtonColor: "#085D89", // sky-800
          }).then(() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/"); //window.close();
          });
        }
      }
    };
    // socket.onerror = (err) => console.error("❌ [SIGNPAGE] WebSocket 에러", err);
    // socket.onclose = () => console.log("🔌 [SIGNPAGE] WebSocket 연결 종료");
    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]); // 현재 계약 ID를 상태로 두고 비교

  // SIGNER 접속 상태 전파
  useEffect(() => {
    if (!contId) return;

    const ws = new WebSocket("ws://localhost:80/ws/signers");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ [SIGNER] WebSocket 연결됨");
      const myRole = "LESSEE"; // 본인의 접속 역할 role은 추후 props/context에서 가져온다고 가정
      ws.send(`JOIN:${contId}:${myRole}`);
    };

    ws.onmessage = event => {
      const msg = event.data;
      console.log("📨 받은 메시지:", msg);

      //---JOINED
      if (msg.startsWith("JOINED:")) {
        const [, msgContId, role] = msg.split(":");
        if (msgContId === contId) dispatch({ type: "SIGNER_CONNECTED", payload: role });
      }

      //---SIGNED
      if (msg.startsWith("SIGNED:")) {
        const [, msgContId, role] = msg.split(":");
        if (msgContId === contId) {
          dispatch({
            type: "SET_SIGNATURE_STATUS",
            payload: {
              ...state.signatureStatus,
              [role.toLowerCase()]: "SIGNED",
            },
          });
        }
      }

    };

    ws.onerror = (err) => console.error("❌ WebSocket 오류:", err);
    ws.onclose = () => console.log("🔌 WebSocket 종료");

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contId]);


  /** ✅ 실제 서명 완료 시 호출할 함수 예시 **/ //==>SignatureCanvas 컴포넌트로 이식
  const onSigned = (role) => {
    const now = new Date().toISOString();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
      wsRef.current.send(`SIGNED:${contId}:${role}`);

    // 상태 갱신
    dispatch({
      type: "SET_SIGNATURE_STATUS",
      payload: {
        ...state.signatureStatus,
        [role.toLowerCase()]: "SIGNED",
      },
    });

    // 서명 시각 기록
    dispatch({ type: "SET_SIGNED_AT", payload: { ...state.signerInfo, signedAt: now } });
  };

  async function handleSignatureImageToServer({ base64Image, mbrId, role, name, telNo, signedAt, ipAddr }) {
    try {
      const response = await axios.post("signature/upload", {
        base64Image,
        mbrId,
        role,
        name,
        telNo,
        signedAt,
        ipAddr,
      });

      if (response.success) {
        console.log("✅ 서명 이미지 업로드 성공");
      } else {
        console.warn("⚠️ 업로드 실패:", response.message);
      }
    } catch (err) {
      console.error("❌ 서명 업로드 오류:", err);
    }
  }

  /** DEBUGGING **/
  useEffect(() => {
    console.log("👤 signerInfo 상태", state.signerInfo);
  }, [state.signerInfo]);


  /*##################################################################################*/
  /** PAGE RENDERER **/
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>에러가 발생했습니다: {error.message || "알 수 없는 오류"}</p>
      </div>
    );
  }
  if (!contId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-500 bg-gray-900">
        <p className="text-lg">계약 ID가 유효하지 않습니다.</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-white mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
        <p className="text-lg">계약 정보를 불러오는 중입니다...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명 {contId}</h1>

      {/* 계약 주요정보 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 좌측: PDF 미리보기 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>
          {/* <ContractPDFViewer /> */}
        </div>

        {/* 우측: 서명판 + 상태표시 */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            {/* <SignatureStatusBoard /> */}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            <SignatureCanvas
              signerInfo={state.signerInfo}
              onSignatureComplete={({ dataUrl, signerInfo }) => {
                console.log("🖋️ 최종 서명 이미지:", dataUrl);
                console.log("🧾 서명자 정보:", signerInfo);
                // 👉 1. DB 전송
                handleSignatureImageToServer({
                  contId: contId,
                  contDtSignType: signerInfo.role,
                  contDtSignDtm: signerInfo.signedAt,
                  contDtSignHashVal: signerInfo.hashVal, // ✅ 해시 포함
                  contDtSignStat: "SIGNED",
                  mbrCd: signerInfo.mbrId,
                  contDtIpAddr: signerInfo.ipAddr,
                  contDtBaseData: dataUrl,
                });
                // 👉 2. PDF에 삽입
                // insertSignatureToPDF(dataUrl, signerInfo);
              }}
              onSign={role => onSigned(role)} />
          </div>
        </div>
      </div>
    </div>
  );
}
