import React, { useRef } from "react";
import OfficeIntroCard from "./myOfficeInfoChildBox/OfficeIntroCard";
import NameCardPreviewBox from "./myOfficeInfoChildBox/NameCardPreviewBox";
import OfficeIntroPreview from "./myOfficeInfoChildBox/OfficeIntroPreviewBox";

export default function OfficeInfoChild({ onEditTabMove }) {
  const introPreviewRef = useRef();

  // 저장 후 프리뷰 새로고침
  const handleSaved = () => {
    if (introPreviewRef.current) {
      introPreviewRef.current.refresh();
    }
  };

  return (
    <div style={{ display: "flex", gap: 40, padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ flex: "0 0 470px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <OfficeIntroCard onSaved={handleSaved} />
      </div>
      <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
        <OfficeIntroPreview ref={introPreviewRef} />
        <NameCardPreviewBox onEditClick={onEditTabMove} />
      </div>
    </div>
  );
}
