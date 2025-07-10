import React, { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAxios } from "../../hooks/useAxios";
import Label from "../form/Label";


function AddLessee({ selectedListing, onSave, onBack }) {
  const [lesseeInfo, setLesseeInfo] = useState();
  const [wishlist, setWishlist] = useState([]);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, item }
  const [modalData, setModalData] = useState(null);
  /*
    lessee 필수요소
    *임차인코드     mbrCd
    *임차인실명     mbrNm
    *임차인전화번호 mbrTelno
    *임차인이메일   mbrEmlAddr
    *임차인기본주소 mbrBasicAddr
    *임차인상세주소 mbrDetailAddr
    *임차인우편주소 mbrZip
   */
  const axios = useAxios();
  useEffect(() => {
    axios.post("cont/new/lessee", { lstgId: selectedListing.lstgId })
      .then(data => setWishlist(data))
  }, [selectedListing?.lstgId, axios]);

  const handleRightClick = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      item
    });
  };
  const handleCloseContextMenu = () => setContextMenu(null);
  const handleOpenModal = () => {
    setModalData(contextMenu.item);
    setContextMenu(null);
  };
  const handleSubmit = () => {
    onSave(lesseeInfo);
  };

  return (
    <>
      <div className="relative">
        <Label>입주희망 회원 목록</Label>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-3 gap-4 overflow-y-auto max-h-[300px]">
          {wishlist.map((item, idx) => (
            <div
              key={idx}
              onContextMenu={(e) => handleRightClick(e, item)}
              className="flex flex-col items-center p-3 border rounded-lg bg-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-sm"
            >
              <img
                src={item.profileImgUrl || "/images/재윤비버.png"}
                alt="프로필"
                className="w-16 h-16 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-semibold text-gray-800 dark:text-white">
                {item.mbrNm}
              </span>
            </div>
          ))}
        </div>

        {/* 우클릭 메뉴 */}
        {contextMenu && (
          <div
            onClick={handleOpenModal}
            onMouseLeave={handleCloseContextMenu}
            className="fixed bg-white border rounded-md shadow-lg px-4 py-2 text-sm z-[1000] hover:bg-gray-100 cursor-pointer"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`
            }}
          >
            상세보기
          </div>
        )}

        {/* 모달 */}
        {modalData && (
          <div className="fixed inset-0 z-[2000] bg-black bg-opacity-10 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80">
              <h2 className="text-lg font-bold text-center mb-4 text-gray-800 dark:text-white">
                회원 상세 정보
              </h2>
              <img
                src={modalData.profileImgUrl || "/images/재윤비버.png"}
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
              <p className="mt-3 text-center text-base font-semibold text-gray-700 dark:text-gray-200">
                {modalData.mbrNm}
              </p>
              <p className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
                {modalData.mbrBasicAddr}<br />{modalData.mbrDetailAddr}
              </p>
              <p className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
                {modalData.mbrTelno}
              </p>
              <p className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
                {modalData.mbrEmlAddr}
              </p>

              <div className="mt-5 text-center gap-3">
                <button
                  onClick={() => setModalData(null)}
                  className="px-5 py-1.5 text-sm rounded bg-gray-200 text-gray-400 hover:bg-gray-500 hover:text-white"
                >
                  닫기
                </button>
                <button
                  onClick={() => { setModalData(modalData); handleSubmit(); }}
                  className="px-5 py-1.5 text-sm rounded bg-amber-600 text-white hover:bg-amber-800 hover:text-shadow-amber-200"
                >
                  임차인 선택
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Label>입주희망 회원 목록</Label>
      <ComponentCard
        title="🧑🏻‍💼 계약 임차인 정보"
        desc="임차인의 정보를 확인해주세요."
        onBack={onBack}
      >
        {/* 상단: 좋아요 회원 리스트 */}
        <div className="mb-6 p-4 rounded border bg-gray-50">

        </div>

        {/* 입력 폼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="mbrNm"
            placeholder="임차인 실명"
            value={lesseeInfo?.mbrNm}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, mbrNm: e.target.value })}
          />
          <Input
            name="mbrBasicAddr"
            placeholder="임차인 기본주소"
            value={lesseeInfo?.mbrBasicAddr}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, mbrBasicAddr: e.target.value })}
          />                <Input
            name="mbrDetailAddr"
            placeholder="임차인 상세주소"
            value={lesseeInfo?.mbrDetailAddr}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, mbrDetailAddr: e.target.value })}
          />
          <Input
            name="mbrTelno"
            placeholder="임차인 전화번호"
            value={lesseeInfo?.mbrTelno}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, mbrTelno: e.target.value })}
          />
          <Input
            name="mbrEmlAddr"
            placeholder="임차인 이메일"
            value={lesseeInfo?.mbrEmlAddr}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, mbrEmlAddr: e.target.value })}
          />
          <Input
            name=""
            placeholder="계약 관련 메모"
            value={lesseeInfo?.lesseeNote}
            onChange={(e) => setLesseeInfo({ ...lesseeInfo, lesseeNote: e.target.value })}
          />
          <input type="text" value={lesseeInfo?.mbrCd} name="mbrCd" placeholder="회원코드" />
        </div>

        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            저장 및 다음
          </Button>
        </div>
      </ComponentCard>
    </>
  );
}

export default AddLessee;
