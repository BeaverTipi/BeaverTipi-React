import React, { useImperativeHandle, forwardRef, useState, useEffect } from "react";
import axios from "axios";

const OfficeIntroPreview = forwardRef((props, ref) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // 등록된 소개글 프리뷰 새로고침 함수
  const refresh = () => {
    setLoading(true);
    axios.get("/rest/broker/introcard/user")
      .then(res => {
        // 서버에서 filePathUrl만 제대로 오면 끝!
        const url = res.data?.introCard?.filePathUrl;
        console.log("서버에서 받은 filePathUrl:", url);
        setImgUrl(url ? url + "?t=" + Date.now() : null);
      })
      .catch(() => setImgUrl(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  useImperativeHandle(ref, () => ({ refresh }));

  return (
    <div style={{
      width: 390,
      minHeight: 230,
      margin: "0 auto",
      textAlign: "center",
      borderRadius: 14,
      background: "#f7f9fb",
      boxShadow: "0 2px 16px #3a5dfb18",
      padding: "18px 0 8px 0"
    }}>
      <h4 style={{ margin: "0 0 12px 6px", fontWeight: 700, color: "#283355", fontSize: 20 }}>
        등록된 소개글
      </h4>
      {loading ? (
        <div style={{
          minHeight: 200, color: "#bbb",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17
        }}>
          로딩중...
        </div>
      ) : imgUrl ? (
        <img
          src={imgUrl}
          alt="사무소 소개카드"
          style={{
            width: 390,
            height: "auto",
            borderRadius: 13,
            boxShadow: "0 2px 12px #46609814",
            background: "#fff",
            margin: "0 auto",
            display: "block"
          }}
        />
      ) : (
        <div style={{
          minHeight: 200, color: "#bbb",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17
        }}>
          등록된 소개글이 없습니다.
        </div>
      )}
    </div>
  );
});

export default OfficeIntroPreview;
