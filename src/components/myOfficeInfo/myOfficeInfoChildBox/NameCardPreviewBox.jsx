import React, { useState, useEffect } from "react";
import axios from "axios";

export default function NameCardPreviewBox({ onEditClick }) {
  const [hovered, setHovered] = useState(false);
  const [mainCardUrl, setMainCardUrl] = useState(null);

  useEffect(() => {
    // 명함 리스트 불러와서 대표 명함 찾기
    axios.get("/rest/broker/namecard/user").then(res => {
      const mbrCd = res.data.mbrCd;
      if (mbrCd) {
        axios.get(`/rest/broker/namecard/list/${mbrCd}`)
          .then(r => {
            const arr = Array.isArray(r.data) ? r.data : [];
            const mainCard = arr.find(c => c.docTypeCd === "NAMECARD_MAIN") || arr[0];
            if (mainCard && mainCard.filePathUrl) {
              setMainCardUrl(mainCard.filePathUrl);
            }
          });
      }
    });
  }, []);

  return (
    <div style={{ width: 390, margin: "0 auto 10px auto" }}>
      <h4 style={{ margin: "0 0 14px 2px", fontWeight: 700, color: "#283355" }}>나의 명함</h4>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          width: "100%",
          height: 210,
          background: "#b2bbd4",
          borderRadius: 13,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 20,
          boxShadow: "0 2px 12px #3a5dfb18",
          transition: "box-shadow 0.15s"
        }}
      >
        {mainCardUrl ? (
          <img
            src={mainCardUrl}
            alt="대표 명함"
            style={{
              width: 360,
              height: 180,
              objectFit: "cover",
              borderRadius: 11,
              boxShadow: "0 1px 6px #4557a911",
              display: "block"
            }}
          />
        ) : (
          "대표 명함 이미지 없음"
        )}

        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(34,42,69,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <button
              onClick={onEditClick}
              style={{
                background: "#fff",
                color: "#3a5dfb",
                border: "1.5px solid #3a5dfb",
                borderRadius: 7,
                padding: "11px 28px",
                fontWeight: 700,
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 2px 12px #3a5dfb22",
                transition: "all 0.15s"
              }}
            >
              내 명함 관리
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
