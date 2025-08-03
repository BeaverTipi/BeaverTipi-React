import Swal from "sweetalert2";

/**
 * SweetAlert 기반 로딩창 (단계별 메시지 전환 및 애니메이션)
 * @param {Array} steps - 단계 배열 (예: ["메시지1", "메시지2", "메시지3"])
 * @param {number} interval - 각 단계별 유지 시간(ms)
 * @returns {Promise} 모든 단계가 완료될 때 resolve
 *
 * 사용 예)
 * await showLoadingSwal([
 *   "[1/3] 서명자의 계약 참여 여부를 확인합니다...",
 *   "[2/3] 계약 서류의 이전 서명 기록을 확인합니다...",
 *   "[3/3] 유효한 접근입니다. 잠시만 기다려주세요..."
 * ], 1000);
 */
export async function showLoadingSwal(steps, interval = 1000) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("steps는 최소 1개 이상의 메시지 배열이어야 합니다.");
  }

  const totalSteps = steps.length;

  // SweetAlert 최초 실행 (1단계)
  Swal.fire({
    title: `1/${totalSteps} 단계 진행 중`,
    html: `
      <div style="text-align:center;">
        <div style="width:100%;background:#eee;border-radius:8px;overflow:hidden;margin-bottom:8px;">
          <div id="swal-progress-bar" style="height:8px;width:0%;background:#3b82f6;transition:width 0.4s;"></div>
        </div>
        <p id="swal-message" style="transition:opacity 0.3s;">${steps[0]}</p>
      </div>
    `,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  // 단계 반복 실행
  for (let i = 0; i < totalSteps; i++) {
    const progress = Math.floor(((i + 1) / totalSteps) * 100);

    // 프로그레스바와 제목 업데이트
    Swal.update({
      title: `${i + 1}/${totalSteps} 단계 진행 중`,
    });

    // 프로그레스바 애니메이션
    const progressBar = document.querySelector("#swal-progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // 메시지 텍스트 부드럽게 전환
    const messageEl = document.querySelector("#swal-message");
    if (messageEl) {
      messageEl.style.opacity = 0;
      await new Promise((resolve) => setTimeout(resolve, 200)); // 페이드 아웃
      messageEl.innerText = steps[i];
      messageEl.style.opacity = 1;
    }

    // 각 단계 유지 시간
    if (i < totalSteps - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}
