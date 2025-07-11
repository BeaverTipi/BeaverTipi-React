import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Textarea from "../../form/input/TextArea";
import Checkbox from "../../form/input/CheckBox";

export default function ContractLawSection() {
  return (
    <ComponentCard
      title="법률 조항 및 의무"
      desc="임대인과 임차인의 권리, 의무, 해지 조건 등을 확인해주세요."
    >
      <div className="space-y-6 text-sm leading-relaxed">
        {/* 제4조 */}
        <div>
          <p className="font-bold">제4조 (임차주택의 사용·관리·수선)</p>
          <p>
            ① 임차인은 임대인의 동의 없이 임차주택의 구조변경, 전대, 양도 등 사용 변경을 할 수 없습니다.
            <br />
            ② 임대인과 임차인은 사용·수선·비용부담에 대한 합의를 하며, 합의되지 않을 시 관계법령에 따릅니다.
          </p>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">임대인 부담</label>
              <Textarea name="landlordBurden" placeholder="임대인 부담 수선비 내용 입력" />
            </div>
            <div>
              <label className="font-semibold">임차인 부담</label>
              <Textarea name="tenantBurden" placeholder="임차인 부담 수선비 내용 입력" />
            </div>
          </div>
        </div>

        {/* 제5~제13조 요약 텍스트 */}
        <div>
          <p className="font-bold">제5조 (계약의 해제)</p>
          <p>
            임차인이 중도금/잔금 지급 전까지 계약을 해제할 수 있으며, 임대인도 동등한 권리를 가집니다.
          </p>

          <p className="font-bold mt-3">제6조 (채무불이행과 손해배상)</p>
          <p>
            일방이 계약을 이행하지 않을 경우 손해배상의 책임이 있으며, 사전 통보 없이 계약은 무효 처리됩니다.
          </p>

          <p className="font-bold mt-3">제7조 (계약의 해지)</p>
          <p>
            임차인은 주택 목적대로 사용 불가능하거나 기타 사유 발생 시 계약을 해지할 수 있습니다.
          </p>

          <p className="font-bold mt-3">제8조 (갱신 요구와 거절)</p>
          <p>
            임대차 종료 6개월 전부터 2개월 전까지 계약 갱신 요구 가능하며, 임대인은 법령에 따라 거절할 수 있습니다.
          </p>

          <p className="font-bold mt-3">제9조 (확정일자 등)</p>
          <p>
            주택임대차보호법에 따라 확정일자를 부여받을 수 있으며, 주소변경 시 즉시 통보하여야 합니다.
          </p>

          <p className="font-bold mt-3">제10조 (비용의 정산)</p>
          <p>
            계약 종료 시 비용 정산은 당사자 합의 또는 법령에 따릅니다.
          </p>

          <p className="font-bold mt-3">제11조 (분쟁의 해결)</p>
          <p>
            분쟁 발생 시 주택임대차분쟁조정위원회, 법원 등의 절차를 통해 해결합니다.
          </p>

          <p className="font-bold mt-3">제12조 (개인정보 수집 및 이용 동의)</p>
          <p>
            계약 이행 및 법적 처리 목적에 따라 개인정보 수집에 동의합니다.
          </p>

          <p className="font-bold mt-3">제13조 (통지의 방법)</p>
          <p>
            계약당사자 간의 통지는 문서로 발송하며, 주소 이전 시 즉시 통보합니다.
          </p>
        </div>

        {/* 동의 체크 */}
        <div className="mt-6">
          <Checkbox name="agreedTerms" label="상기 조항을 충분히 읽고 이해하였으며, 이에 동의합니다." />
        </div>
      </div>
    </ComponentCard>
  );
}
