import React from "react";

export function numberToKorean(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "";

  const numUnits = ["", "십", "백", "천"];
  const manUnits = ["", "만", "억", "조", "경"];
  const numChars = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];

  if (amount === 0) return "영 원";

  let result = "";
  let unitIndex = 0;

  while (amount > 0) {
    const chunk = amount % 10000;
    if (chunk > 0) {
      let chunkStr = "";
      const digits = String(chunk).padStart(4, "0").split("").map(Number);

      digits.forEach((digit, index) => {
        if (digit > 0) {
          chunkStr += numChars[digit] + numUnits[3 - index];
        }
      });

      result = chunkStr + manUnits[unitIndex] + (result ? " " + result : "");
    }

    amount = Math.floor(amount / 10000);
    unitIndex++;
  }

  return result.trim() + " 원";
}
