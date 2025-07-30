import React, { useState, useEffect, useRef } from "react";
import NameCardPreview from "./nameCard/NameCardPreview";
import NameCardCarousel from "./nameCard/NameCardCarousel";
import axios from "axios";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import Input from "../form/input/InputField";

const templates = [
  { id: 1, name: "화이트리넨", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_whitelinen.png" },
  { id: 2, name: "크림코튼", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_creamcotton.png" },
  { id: 3, name: "스펙클", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_recyclespecle.png" },
  { id: 4, name: "브라운크라프트", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_browncraft.png" },
  { id: 5, name: "차콜카드", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_charcole.png" },
  { id: 6, name: "파스텔블루린넨", bg: "https://beavertipi.s3.ap-southeast-2.amazonaws.com/public/broker/introcard/static/template_namecard_pastelbluelinen.png" }
];

const defaultTexts = [
  { key: "bigTitle", value: "", fontSize: 24, pos: { x: 16, y: 20 } },
  { key: "smallTitle", value: "", fontSize: 16, pos: { x: 16, y: 54 } },
  { key: "content1", value: "", fontSize: 14, pos: { x: 16, y: 88 } },
  { key: "content2", value: "", fontSize: 14, pos: { x: 16, y: 112 } },
  { key: "content3", value: "", fontSize: 14, pos: { x: 16, y: 136 } }
];

export default function OfficeNameCard() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({
    template: null,
    bgImageUrl: "",
    bgColor: "#f8f8f8",
    textColor: "#222"
  });
  const [texts, setTexts] = useState(defaultTexts);
  const [refresh, setRefresh] = useState(false);
  const [mbrCd, setMbrCd] = useState("");
  const [nameCards, setNameCards] = useState([]);
  const [mainNameCardId, setMainNameCardId] = useState(null);

  const previewRef = useRef();

  useEffect(() => {
    axios.get("/rest/broker/namecard/user").then(res => setMbrCd(res.data.mbrCd));
  }, []);
  useEffect(() => {
    if (mbrCd) {
      axios.get(`/rest/broker/namecard/list/${mbrCd}`).then(res => {
        setNameCards(Array.isArray(res.data) ? res.data : []);
        const mainCard = (Array.isArray(res.data) ? res.data : []).find(card => card.docTypeCd === "NAMECARD_MAIN");
        setMainNameCardId(mainCard?.fileId || null);
      });
    }
  }, [mbrCd, refresh]);

  const handleAddText = () => {
    setTexts(prev => [
      ...prev,
      {
        key: `text${Date.now()}`,
        value: "",
        fontSize: 14,
        pos: { x: 16, y: 160 + prev.length * 24 }
      }
    ]);
  };
  const handleRemoveText = idx => {
    setTexts(prev => prev.filter((_, i) => i !== idx));
  };
  const handleTextChange = (idx, value) => {
    setTexts(prev => prev.map((t, i) => i === idx ? { ...t, value } : t));
  };
  const handleTextFontSize = (idx, size) => {
    setTexts(prev => prev.map((t, i) => i === idx ? { ...t, fontSize: size } : t));
  };
  const handleTextPos = (idx, pos) => {
    setTexts(prev => prev.map((t, i) => i === idx ? { ...t, pos } : t));
  };

  const handleTemplate = (tid) => {
    const bg = templates.find(t => t.id === tid)?.bg || "";
    setForm(prev => ({
      ...prev,
      template: tid,
      bgImageUrl: bg
    }));
  };
  const handleBgColor = (e) => {
    setForm(prev => ({
      ...prev,
      bgColor: e.target.value,
      bgImageUrl: "",
      template: null
    }));
  };
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) setForm(prev => ({
      ...prev,
      bgImageUrl: URL.createObjectURL(file),
      template: null
    }));
  };
  const handleTextColor = (e) =>
    setForm(prev => ({ ...prev, textColor: e.target.value }));

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfiles(prev => [
      ...prev,
      {
        url,
        pos: { x: 40 + prev.length * 40, y: 40 },
        size: 90,
        shape: "circle"
      }
    ]);
    e.target.value = "";
  };
  const handleProfileDelete = idx =>
    setProfiles(prev => prev.filter((_, i) => i !== idx));
  const handleProfileUpdate = (idx, data) =>
    setProfiles(prev => prev.map((p, i) => i === idx ? { ...p, ...data } : p));
  const handleProfileShape = shape => {
    if (!profiles.length) return;
    setProfiles(prev => prev.map((p, i) => (i === prev.length - 1 ? { ...p, shape } : p)));
  };

  const handleSave = async () => {
    if (!previewRef.current) {
      await Swal.fire('오류', "미리보기 없음!", "error");
      return;
    }
    const canvas = await html2canvas(previewRef.current);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        await Swal.fire('오류', "이미지 변환 실패!", "error");
        return;
      }
      const file = new File([blob], "namecard.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceRef", "BROKER");
      formData.append("sourceId", mbrCd);
      formData.append("docTypeCd", "NAMECARD");
      try {
        const res = await axios.post("/rest/broker/namecard/save", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.result === "success") {
          await Swal.fire('저장 성공!', '명함이 저장되었습니다.', 'success');
          setRefresh(v => !v);
        } else {
          Swal.fire('저장 실패', res.data.message, 'error');
        }
      } catch (err) {
        Swal.fire('오류', err.message, 'error');
      }
    }, "image/png");
  };
  const handleDownload = async () => {
    if (!previewRef.current) {
      await Swal.fire('오류', "명함 미리보기 없음!", "error");
      return;
    }
    const canvas = await html2canvas(previewRef.current);
    const link = document.createElement("a");
    link.download = "namecard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleDelete = async (fileId, fileAttachSeq) => {
    const confirm = await Swal.fire({
      title: '명함을 삭제할까요?',
      text: '삭제하면 되돌릴 수 없어요.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#d33'
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await axios.delete('/rest/broker/namecard/delete', {
        params: { fileId, fileAttachSeq }
      });
      if (res.data.result === "success") {
        await Swal.fire('삭제 완료!', '명함이 삭제되었습니다.', 'success');
        setRefresh(v => !v);
      } else {
        Swal.fire('삭제 실패', res.data.message || '문제가 발생했어요', 'error');
      }
    } catch (e) {
      Swal.fire('삭제 에러', e.message, 'error');
    }
  };
  const handleSetMain = async (fileId) => {
    if (!fileId) return;
    try {
      const res = await axios.post('/rest/broker/namecard/set-main', null, {
        params: { nameCardId: fileId }
      });
      if (res.data.result === "success") {
        await Swal.fire('대표명함!', '대표명함으로 지정되었습니다!', 'success');
        setRefresh(v => !v);
      } else {
        Swal.fire('대표명함 지정 실패', res.data.message, 'error');
      }
    } catch (e) {
      Swal.fire('대표명함 지정 오류', e.message, 'error');
    }
  };

  const grayInput = {
    width: 320,
    padding: "9px 12px",
    background: "#f5f6fa",
    border: "1.5px solid #d3d5dd",
    borderRadius: 8,
    color: "#222",
    fontSize: 16,
    marginBottom: 2,
    outline: "none",
    transition: "border .16s"
  };

  return (
    <div style={{
      width: "100%", maxWidth: 900,
      margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center",
      transform: "translateX(-20px)"
    }}>
      <style>
        {`
        .namecard-toolbar {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          margin: 22px 0 18px 0;
        }
        .namecard-toolbar__item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .namecard-toolbar__label {
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
        }
        `}
      </style>
      {/* 명함 미리보기 */}
      <div style={{ margin: "36px 0 28px 0" }}>
        <NameCardPreview
          ref={previewRef}
          width={360}
          height={200}
          bgImage={form.bgImageUrl}
          bgColor={form.bgColor}
          textColor={form.textColor}
          profiles={profiles}
          onProfileDelete={handleProfileDelete}
          onProfileUpdate={handleProfileUpdate}
          texts={texts}
          onTextFontSize={handleTextFontSize}
          onTextPos={handleTextPos}
          onRemoveText={handleRemoveText}
        />
      </div>
      {/* 툴바 */}
      <div className="namecard-toolbar">
        {/* 1행 */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 4, width: "100%" }}>
          <div className="namecard-toolbar__item">
            <span className="namecard-toolbar__label">배경 템플릿</span>
            {templates.map(t => (
              <button key={t.id} onClick={() => handleTemplate(t.id)}
                style={{
                  width: 32, height: 32,
                  backgroundImage: `url(${t.bg})`,
                  backgroundSize: "cover",
                  border: form.template === t.id ? "2.5px solid #222" : "1.5px solid #bbb",
                  borderRadius: 8, outline: "none", cursor: "pointer"
                }}
                aria-label={t.name}
                title={t.name}
              />
            ))}
          </div>
          <div className="namecard-toolbar__item">
            <span className="namecard-toolbar__label">배경색상</span>
            <input
              type="color"
              value={form.bgColor}
              onChange={handleBgColor}
              style={{
                width: 32, height: 32, border: "1.5px solid #bbb", borderRadius: 8, padding: 0, background: "none", cursor: "pointer"
              }}
              aria-label="배경 색상 선택"
            />
          </div>
          {/* 배경직접설정 부분! */}
          <div className="namecard-toolbar__item" style={{ alignItems: "center" }}>
            <span className="namecard-toolbar__label">배경직접설정</span>
            <span style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 5
            }}>
              <label style={{
                cursor: "pointer",
                color: "#4260ff",
                fontWeight: 500,
                display: "flex",
                alignItems: "center"
              }}>
                사진 불러오기
                <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: "none" }} />
              </label>
              <div style={{
                width: 32, height: 32,
                borderRadius: 8,
                border: "1.5px solid #ccc",
                overflow: "hidden",
                marginLeft: 6,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {form.bgImageUrl ? (
                  <img src={form.bgImageUrl} alt="bg" style={{
                    width: "100%", height: "100%",
                    objectFit: "cover"
                  }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: form.bgColor,
                  }} />
                )}
              </div>
            </span>
          </div>
        </div>
        {/* 2행 */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, width: "100%" }}>
          <div className="namecard-toolbar__item">
            <span className="namecard-toolbar__label">글씨색상</span>
            <input
              type="color"
              value={form.textColor}
              onChange={handleTextColor}
              style={{
                width: 32, height: 32, border: "1.5px solid #bbb", borderRadius: 8, padding: 0, background: "none", cursor: "pointer"
              }}
              aria-label="텍스트 색상 선택"
            />
          </div>
          <div className="namecard-toolbar__item">
            <button onClick={handleAddText} style={{
              border: "1.5px solid #2e7d32",
              color: "#2e7d32",
              background: "#fff",
              borderRadius: 6,
              padding: "3px 13px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer"
            }}>텍스트 추가</button>
          </div>
          <div style={{ flex: 1 }} />
          {/* 프로필 부분! */}
          <div className="namecard-toolbar__item" style={{ alignItems: "center" }}>
            <span className="namecard-toolbar__label">프로필</span>
            <span style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 5
            }}>
              <label style={{
                cursor: "pointer",
                color: "#4260ff",
                fontWeight: 500,
                display: "flex",
                alignItems: "center"
              }}>
                사진 불러오기
                <input type="file" accept="image/*" onChange={handleProfileUpload} style={{ display: "none" }} />
              </label>
              <button style={{
                border: profiles.length && profiles[profiles.length - 1].shape === "circle" ? "2px solid #3a5dfb" : "1px solid #aaa",
                borderRadius: "50%", width: 26, height: 26, marginLeft: 7, fontSize: 15
              }} onClick={() => handleProfileShape("circle")} title="원형">●</button>
              <button style={{
                border: profiles.length && profiles[profiles.length - 1].shape === "rect" ? "2px solid #3a5dfb" : "1px solid #aaa",
                borderRadius: 6, width: 26, height: 26, marginLeft: 3, fontSize: 15
              }} onClick={() => handleProfileShape("rect")} title="사각">■</button>
            </span>
          </div>
        </div>
      </div>

      {/* 텍스트 입력 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px 16px",
        marginBottom: 14,
        width: 670
      }}>
        {texts.map((t, idx) => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Input
              value={t.value}
              onChange={e => handleTextChange(idx, e.target.value)}
              style={grayInput}
              placeholder={`텍스트 ${idx + 1}`}
              maxLength={24}
            />
            {texts.length > 1 &&
              <button onClick={() => handleRemoveText(idx)}
                style={{
                  border: "none",
                  background: "#fff",
                  color: "#e33",
                  fontWeight: 800,
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  fontSize: 17,
                  marginLeft: 0
                }}
                title="텍스트 삭제"
              >×</button>
            }
          </div>
        ))}
      </div>
      <div style={{
        display: "flex",
        gap: 18,
        marginBottom: 18,
        marginTop: 4,
        width: 320
      }}>
        <button onClick={handleDownload} style={{
          width: 140, background: "#ececec", color: "#3a5dfb",
          fontWeight: 700, borderRadius: 8, border: "1.5px solid #bbb",
          height: 40, fontSize: 15, letterSpacing: "1px",
          boxShadow: "0 2px 7px #5175fd13", cursor: "pointer"
        }}>다운받기</button>
        <button onClick={handleSave} style={{
          width: 140, background: "#ececec", color: "#e33",
          fontWeight: 800, borderRadius: 8, border: "1.5px solid #e33",
          height: 40, fontSize: 15, letterSpacing: "1px",
          boxShadow: "0 2px 7px #e3332a11", cursor: "pointer"
        }}>저장</button>
      </div>
      <div style={{ width: "100%", maxWidth: 900, margin: "30px 0 0 0", display: "flex", justifyContent: "center" }}>
        {mbrCd &&
          <NameCardCarousel
            cards={nameCards}
            onSetMain={handleSetMain}
            mainNameCardId={mainNameCardId}
            onDelete={handleDelete}
          />
        }
      </div>
      <div style={{
        marginTop: 18, fontSize: 14, color: "#7a88a9", textAlign: "center"
      }}>
        💡 명함을 자유롭게 커스텀하고, 저장/다운받기 버튼으로 내 정보를 멋지게 관리해보세요!
      </div>
    </div>
  );
}
