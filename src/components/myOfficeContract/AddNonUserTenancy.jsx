import { useState } from "react";
import Button from "../ui/button/Button";

function AddNonUserTenancy({ selectedListing, onSave, onBack }) {
  const [form, setForm] = useState({ mbrNm: "", phone: "" });

  const handleSubmit = () => {
    const newTenancyInfo = { ...form }; // 실제 저장 로직은 서버 연동
    onSave(newTenancyInfo);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📝 임대인 정보 입력</h2>
      <input
        type="text"
        placeholder="이름"
        value={form.mbrNm}
        onChange={(e) => setForm({ ...form, mbrNm: e.target.value })}
        className="border px-3 py-2 rounded mb-2 block w-full"
      />
      <input
        type="text"
        placeholder="전화번호"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="border px-3 py-2 rounded mb-4 block w-full"
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onBack}>뒤로</Button>
        <Button onClick={handleSubmit} className="bg-blue-500 text-white">저장</Button>
      </div>
    </div>
  );
}

export default AddNonUserTenancy;