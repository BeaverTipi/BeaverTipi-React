import React from "react";

export function getKSTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // UTC 기준 밀리초
  return new Date(utc + 9 * 60 * 60000); // UTC + 9시간
}
