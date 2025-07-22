import React from "react";

const NameCardPreview = React.forwardRef(({
  width = 360,
  height = 200,
  bigTitle,
  smallTitle,
  content1,
  content2,
  content3,
  color = "#3a5dfb",
  bgImage,
  textColor = "#222",
  profiles = [],
  onProfileDelete,
  onProfileUpdate,
  onSelect
}, ref) => {

  // 이동/크기조절
  const handleMoveMouseDown = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y } = profiles[idx].pos;
    const onMouseMove = (moveEvt) => {
      const diffX = moveEvt.clientX - startX;
      const diffY = moveEvt.clientY - startY;
      onProfileUpdate(idx, { pos: { x: x + diffX, y: y + diffY } });
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleResizeMouseDown = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startSize = profiles[idx].size;
    const onMouseMove = (moveEvt) => {
      const diff = moveEvt.clientX - startX;
      const newSize = Math.max(32, startSize + diff);
      onProfileUpdate(idx, { size: newSize });
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
        height,
        background: bgImage ? `url(${bgImage}) center/cover` : color,
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        overflow: "hidden",
        userSelect: "none",
        zIndex: 1,
        pointerEvents: "auto"
      }}
    >
      {/* 텍스트 영역 */}
      <div style={{ padding: 16, color: textColor }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: ".5px" }}>{bigTitle || "홍길동"}</h2>
        <h4 style={{ margin: "4px 0", fontSize: 16, fontWeight: 500 }}>{smallTitle || "회사명/직책"}</h4>
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>{content1 || "010-1234-5678"}</p>
        <p style={{ margin: "4px 0 0", fontSize: 14 }}>{content2 || "email@example.com"}</p>
        <p style={{ margin: "4px 0 0", fontSize: 14 }}>{content3 || "주소/기타 정보"}</p>
      </div>

      {/* 프로필 여러장 + X버튼만 */}
      {profiles.map((profile, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: profile.pos.x,
            top: profile.pos.y,
            zIndex: 10 + idx,
            pointerEvents: "auto", // ← 이거!
            width: profile.size,
            height: profile.size,
            cursor: "move"
          }}
          onMouseDown={e => handleMoveMouseDown(idx, e)}
          onClick={e => { e.stopPropagation(); onSelect?.(idx); }}
        >
          <div
            style={{
              position: "relative",
              width: profile.size,
              height: profile.size,
              borderRadius: profile.shape === "circle" ? "50%" : 8,
              overflow: "visible",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              background: "#fff"
            }}
          >
            <img
              src={profile.url}
              alt={`profile${idx}`}
              draggable={false}
              style={{
                position: "relative",
                width: profile.size,
                height: profile.size,
                borderRadius: profile.shape === "circle" ? "50%" : 8,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                background: "#fff"
              }}
            />
            {/* X버튼 */}
            <button
              style={{
                position: "absolute", 
                top: 0, 
                right: 0, 
                background: "#fff", 
                transform: "translate(50%, -50%)",
                border: "1px solid #bbb", 
                borderRadius: "50%",
                width: 22, 
                height: 22, 
                cursor: "pointer", 
                fontWeight: 900, 
                color: "#e33",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,              
                lineHeight: 1 
              }}
              onClick={e => { e.stopPropagation(); onProfileDelete(idx); }}
              tabIndex={-1}
              aria-label="삭제"
            >×</button>
          </div>
          {/* 크기조절 핸들 */}
          <div
            onMouseDown={e => handleResizeMouseDown(idx, e)}
            style={{
              position: "absolute",
              right: -16,
              bottom: -16,
              width: 24,
              height: 24,
              background: "#fff",
              border: "2px solid #3a5dfb",
              borderRadius: 8,
              cursor: "nwse-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#3a5dfb",
              boxShadow: "0 2px 8px #3a5dfb11",
              userSelect: "none"
            }}
            tabIndex={-1}
          >↔</div>
        </div>
      ))}
    </div>
  );
});

export default NameCardPreview;
