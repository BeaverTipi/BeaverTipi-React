import React from "react";

export function waitForStateChange(checkFn, getState, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    setTimeout(() => {
      const step = () => {
        try {
          const state = getState();
          const passed = checkFn(state);
          if (passed) return resolve(state);
          if (Date.now() - start > timeout) {
            console.warn("🧨 조건 미충족 상태:", state);
            return reject(new Error("Timeout waiting for state change"));
          }
          requestAnimationFrame(step);
        } catch (err) {
          reject(err);
        }
      };
      step();
    }, 10); // 🐢 첫 tick delay
  });
}
