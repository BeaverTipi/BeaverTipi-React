import { useEffect, useRef, useState, useCallback } from "react";
import Swal from "sweetalert2";

/**
 * 상태 변화(dispatch 후 reducer state 갱신)를 기다린 뒤 다음 로직을 순차적으로 실행할 수 있도록 도와주는 커스텀 훅.
 * SweetAlert2 기반의 로딩 UI와 프로그레스 표시 기능을 내장하고 있어, 여러 단계를 직관적으로 연결할 수 있음.
 *
 * @param {Function} defaultCheckFn - 상태 변화 여부를 판단할 기본 검증 함수. (state => boolean)
 * @param {any} state - 감시할 상태 (useReducer 또는 useState로 관리되는 값)
 * @param {number} [defaultTimeout=1000] - 상태 변화 감시 기본 타임아웃(ms)
 *
 * @returns {Object} 
 * @returns {boolean} resolved - 마지막 상태 변화 대기 성공 여부
 * @returns {Function} chain - 여러 상태 검증 단계를 순차적으로 실행할 수 있는 함수
 *
 * 사용 예_)
 * const { chain } = useWaitForStateChange(
 *   (state) => state.signerInfo?.status === "SIGNED",
 *   state,
 *   2000
 * );
 *
 * const handleSign = async () => {
 *   dispatch({ type: MSG.U_SIGNED, payload: signerInfo });
 *
 *   await chain(
 *     [(s) => s.signerInfo?.status === "SIGNED", 2000, "서명 완료 대기 중..."],
 *     [(s) => s.tempPdfUrl !== null, 3000, "임시 PDF 생성 대기 중..."]
 *   );
 *
 *   console.log("모든 상태 대기 완료");
 * };
 */
export function useWaitForStateChange(defaultCheckFn, state, defaultTimeout = 1000) {
  const [resolved, setResolved] = useState(false);
  const resolverRef = useRef(null);
  const rejecterRef = useRef(null);
  const timeoutRef = useRef(null);
  const currentCheckFnRef = useRef(defaultCheckFn);

  // 🔄 SweetAlert Progress 애니메이션
  const animateProgress = (from, to) => {
    const progressBar = document.querySelector("#swal-progress-bar");
    if (!progressBar) return;

    let current = from;
    const step = () => {
      if (current < to) {
        current += 1;
        progressBar.style.width = `${current}%`;
        requestAnimationFrame(step);
      }
    };
    step();
  };

  // 🔄 SweetAlert 표시
  const showLoadingSwal = (stepIndex, totalSteps, message, nextMsg, animateFrom) => {
    const progressPercent = Math.floor((stepIndex / totalSteps) * 100);

    if (Swal.isVisible()) Swal.close(); // ✅ 이전 Swal 닫기 (중복 방지)

    Swal.fire({
      title: `${stepIndex}/${totalSteps} 단계 진행 중`,
      html: `
        <div style="text-align:center;">
          <div style="width:100%;background:#eee;border-radius:8px;overflow:hidden;margin-bottom:8px;">
            <div id="swal-progress-bar" style="height:8px;width:${animateFrom}%;background:#3b82f6;"></div>
          </div>
          <p>${message || "상태 확인 중..."}</p>
          ${nextMsg ? `<p style="font-size:0.9em;color:gray;">다음: ${nextMsg}</p>` : ""}
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
        animateProgress(animateFrom, progressPercent);
      },
    });
  };

  // 🔄 상태 변화 대기
  const wait = useCallback(
    (customCheckFn, customTimeout, message, nextMsg, stepIndex, totalSteps, prevProgress) => {
      return new Promise((resolve, reject) => {
        setResolved(false); // ✅ 매 단계 시작 시 초기화

        showLoadingSwal(stepIndex, totalSteps, message, nextMsg, prevProgress);

        resolverRef.current = (val) => {
          clearTimeout(timeoutRef.current); // ✅ 타임아웃 정리
          Swal.close();
          setResolved(true);
          resolve(val);
        };

        rejecterRef.current = (err) => {
          clearTimeout(timeoutRef.current); // ✅ 타임아웃 정리
          Swal.close();
          reject(err);
        };

        currentCheckFnRef.current = customCheckFn;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (rejecterRef.current) rejecterRef.current(new Error("⏱ 상태 변화 대기 중 타임아웃 발생"));
        }, customTimeout);
      });
    },
    [defaultTimeout]
  );

  // 🔄 상태 변경 감지
  useEffect(() => {
    if (!resolved && currentCheckFnRef.current(state)) {
      if (resolverRef.current) {
        resolverRef.current(state);
        resolverRef.current = null;
      }
    }
  }, [state, resolved]);

  // 🔗 체인 실행
  const chain = useCallback(
    async (...steps) => {
      const totalSteps = steps.length;
      let prevProgress = 0;

      for (let i = 0; i < totalSteps; i++) {
        const step = steps[i];
        const [fn, timeout, message] = Array.isArray(step) ? step : [step, defaultTimeout, ""];

        const nextMsg = steps[i + 1]?.[2] || "";
        await wait(fn, timeout || defaultTimeout, message, nextMsg, i + 1, totalSteps, prevProgress);

        prevProgress = Math.floor(((i + 1) / totalSteps) * 100);
      }

      Swal.close();
    },
    [wait, defaultTimeout]
  );

  return { resolved, chain };
}
