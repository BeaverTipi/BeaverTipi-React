import React, { useEffect, useReducer, useRef, useState } from "react";
import { useDomain } from "../hooks/useDomain";
import {
  contractSignatureReducer,
  initialState,
  MSG,
  ROLE,
} from "../js/reducerContractSignature";
import { useAES256 } from "../hooks/useAES256";
import { Navigate, useNavigate, useParams } from "react-router";
import { useSecureAxiosFactory } from "../hooks/useSecureAxiosFactory";
import { createWebSocketHandlers } from "../js/webSocketContractSignautre";
import Swal from "sweetalert2";
import { useWaitForStateChange } from "../hooks/useWaitForStateChange";
import SignaturePDFViewer from "../components/myOfficeContract/ContractSignature/SignaturePDFViewer";
import SignatureStatusBoard from "../components/myOfficeContract/ContractSignature/SignatureStatusBoard";
import SignatureCanvas from "../components/myOfficeContract/ContractSignature/SignatureCanvas";
import { useSignatureHash } from "../hooks/useSignatureHash";
import { getKSTDate } from "../js/getKSTDate";

function ContractSignature() {
  const createSecureAxios = useSecureAxiosFactory();
  const authAxios = createSecureAxios("/rest/contract");
  const { encryptedContId } = useParams();
  const navigate = useNavigate();
  const { encrypt, decrypt, encodeURI, decodeURI } = useAES256();
  const [globalContId, setGlobalContId] = useState(null);
  const [state, dispatch] = useReducer(contractSignatureReducer, initialState);
  const [myRole, setMyRole] = useState(null);
  const { HOSTNAME } = useDomain();
  const PROTOCOL = window.location.protocol === "https:" ? "wss" : "ws";
  const createHash = useSignatureHash();
  const initWs = useRef(null);
  const realtimeWs = useRef(null);
  const getStateRef = useRef(null);
  const [overrideUrl, setOverrideUrl] = useState(null);
  getStateRef.current = state;
  const {
    initWebSocket,
    realtimeWebSocket,
    sendMsg,
    createDispatchWithWebSocket,
    registerTabVisibilityHandler,
  } = createWebSocketHandlers({
    PROTOCOL: PROTOCOL,
    HOSTNAME: HOSTNAME,
    globalContId: globalContId,
    myRole: myRole,
    initWsRef: initWs,
    realtimeWsRef: realtimeWs,
    dispatch: dispatch,
    getState: () => getStateRef.current,
  });
  const dispatchWs = createDispatchWithWebSocket();

  const handleFuckedUp = () => {
    const payload = {
      signerStatus: MSG.U_SIGNED,
      isSigned: true,
      isValid: true,
    };
    if (myRole === ROLE.LESSEE) {
      dispatch(MSG.SET_SIGNERS_LESSOR, payload);
    }
    if (myRole === ROLE.AGENT) {
      dispatch(MSG.SET_SIGNERS_LESSEE, payload);
    }
  };

  useEffect(() => {
    console.debug("암호화된 ID", encryptedContId);
    setGlobalContId(decrypt(decodeURI(encryptedContId)));
    console.debug("디코딩, 복호화까지 된 ID: ", globalContId);
    console.debug("계약ID", globalContId);
    handleAuthorization();
    realtimeWebSocket();
    setTimeout(() => {
      initWebSocket(); // 연결 후 INIT_REQUEST 전송
    }, 300); // 약간의 딜레이
    // handleAuthorizationWithInitWebSocket();
  }, []);

  useEffect(() => {
    if (!globalContId || !myRole) {
      return;
    }
    console.debug("하하");
    // initWebSocket();

    return registerTabVisibilityHandler();
  }, [globalContId, myRole]);

  // const { waitAuthorization } = useWaitForStateChange(
  //   state => state.signers?.[myRole],
  //   state.signers?.[myRole],
  //   5000
  // );

  const handleAuthorization = async () => {
    const { success, message, ...data } = await authAxios.post("authorize", {
      encryptedContId,
      _method: "GET",
    });

    if (!success) {
      Swal.fire("접근 불가", message, "info");
      navigate("/signin");
      return;
    }

    setMyRole(data.myRole);
    setOverrideUrl(data);

    // if (data.myRole === "LESSEE" || data.myRole === "AGENT") {
    //   Swal.fire({
    //     html: "<strong>다른 계약자와 동일한 IP를 사용 중입니다.</strong><br/><p>같은 환경에서 진행 중인지 확인해주세요.</p>",
    //     icon: "warn",
    //     showCancelButton: true,
    //     confirmButtonText: "확인",
    //     cancelButtonText: "거절",
    //     confirmButtonColor: "#085D89", // sky-800
    //     cancelButtonColor: "#a84545 ", // gray-300
    //     scrollbarPadding: false,
    //   });
    // }

    dispatch({ type: MSG.RESET, payload: data });
  };

  const handleAuthorizationWithInitWebSocket = async () => {
    try {
      // 1️⃣ 인가 요청 로딩
      Swal.fire({
        title: "계약 인가 처리 중...",
        text: "계약 정보를 확인하고 있습니다.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { success, message, ...data } = await authAxios.post("authorize", {
        encryptedContId,
        _method: "GET",
      });

      if (!success) {
        Swal.fire("접근 불가", message, "info");
        navigate("/signin");
        return;
      }

      // 2️⃣ myRole / globalContId 설정
      setMyRole(data.myRole);
      setGlobalContId(data.globalContId);

      // 상태를 reducer에 저장
      dispatch({ type: MSG.U_JOINED, payload: data });

      // myRole과 globalContId가 세팅될 때까지 대기
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (myRole && globalContId) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });

      // 3️⃣ INIT WebSocket 연결
      Swal.update({
        title: "서명자 상태 동기화 중...",
        text: "최신 상태를 불러오는 중입니다.",
      });

      await initWebSocket();

      // 4️⃣ REALTIME WebSocket 연결
      Swal.update({
        title: "실시간 연결 중...",
        text: "계약 서명 실시간 연결을 준비 중입니다.",
      });

      realtimeWebSocket();

      // 5️⃣ 완료 메시지
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "계약 페이지 준비 완료!",
        text: "실시간 서명 상태가 동기화되었습니다.",
        timer: 1200,
        showConfirmButton: false,
      });

      console.debug("웹소켓 초기화 및 동기화 완료");
    } catch (authError) {
      console.warn(authError);
      Swal.fire("오류 발생", "인가 처리 중 문제가 발생했습니다.", "error");
    }
  };

  // const handleAuthorization = async () => {
  //   try {
  //     //인가처리
  //     const { success, message, ...data } = await authAxios.post("authorize", {
  //       encryptedContId,
  //       _method: "GET",
  //     });
  //     if (!success) {
  //       Swal.fire("접근 불가", message, "info"); naviate("/signin"); return;
  //     }

  //     console.debug("인가처리 성공!!");

  //     ///payload로 MSG.U_JOINED 액션 실행
  //     dispatch({ type: MSG.U_JOINED, payload: data });
  //     sendMsg(MSG.INIT_REQUEST, state.signers?.[myRole]);
  //     await waitAuthorization(
  //       [s=> s.signature.contId > 10, 2000, "계약 정보 요청 중..."],
  //       [s => s.signers?.[myRole].isJoined === true, 3000, "클라이언트 연결 대기 중..."]
  //     );

  //   }
  //   catch (authError) { console.warn(authError); }
  // };

  const handleSignatureOnSigned = async ({ dataUrl, signerInfo }) => {
    try {
      const signedAt = getKSTDate().toISOString();

      const hashVal = createHash({
        base64Image: dataUrl,
        telno: signerInfo.telno,
        contId: globalContId,
        role: myRole,
        signedAt: signedAt,
      });
      const contractDigitalSign = {
        contId: signerInfo.contId,
        contDtBaseData: dataUrl,
        contDtSignType: signerInfo.role,
        contDtSignDtm: signedAt,
        contDtSignHashVal: hashVal,
      };

      const payload = {
        _method: "POST",
        contractDigitalSign,
      };

      Swal.fire({
        title: "서명 작업을 처리 중입니다...",
        html: "서명 해시 위변조 검증 중입니다.<br/>잠시만 기다려주세요.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const data = await authAxios.post(
        `signature/upload/two/${signerInfo.role}`,
        payload
      );

      // 서버 응답이 성공이면
      if (data.success) {
        Swal.close();
        await Swal.fire({
          icon: "success",
          title: "서명 완료!",
          text: "계약 서명이 성공적으로 완료되었습니다.",
          timer: 1200,
          showConfirmButton: false,
        });
        navigate(-1); // 이전 페이지로 이동
      } else {
        Swal.fire(
          "서명 실패",
          data.message || "서명 처리 중 오류가 발생했습니다.",
          "error"
        );
      }
    } catch (error) {
      console.warn("onSigned ERROR", error);
    }
  };

  //#################### 렌더링 ####################
  if (!state) {
    return <div className="text-red-500">에러 발생: {state.error.message}</div>;
  }
  // 🔍 아직 authorize 중이거나 최초 진입 시
  if (!state.signature || !encryptedContId || !state.signers) {
    return <div className="text-white">계약 정보를 불러오는 중입니다...</div>;
  }

  // 🔍 authorize는 완료됐지만 contId가 유효하지 않을 경우
  if (!globalContId) {
    return <div className="text-yellow-500">계약 ID가 유효하지 않습니다.</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-2xl font-semibold">전자계약 서명</h1>

      {/* 계약 주요정보 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* 좌측: PDF 미리보기 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-auto max-h-[75vh]">
          <h2 className="text-lg font-semibold mb-4">계약서 미리보기</h2>
          <SignaturePDFViewer
            myRole={myRole}
            contId={globalContId}
            // overrideUrl={overrideUrl}
          />
        </div>

        {/* 우측: 서명판 + 상태표시 */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명 상태</h2>
            <SignatureStatusBoard
              signers={state.signers}
              signature={state.signature}
              contId={globalContId}
            />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">서명하기</h2>
            <SignatureCanvas
              signers={state.signers}
              onSigned={handleSignatureOnSigned}
              myRole={myRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractSignature;
