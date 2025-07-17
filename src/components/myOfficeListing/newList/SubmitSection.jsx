import React from "react";
import Button from "../../form/Button";

export default function SubmitSection({ isEdit = false }) {
  return (
    <div className="flex justify-end my-10">
      <Button
        type="submit"
        className="px-8 py-3 text-base font-semibold rounded-xl shadow-md bg-amber-500 hover:bg-amber-600 text-white"
      >
        {isEdit ? "매물 수정" : "매물 등록"}
      </Button>
    </div>
  );
}
