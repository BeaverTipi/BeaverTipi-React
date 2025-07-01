import React, { useEffect } from 'react'
import KakaoMapGeocoderComponent from '../components/KakaoMapGeocoderComponent';

const { kakao } = window;
function OfficeMap() {

  // const brokerAddr = "대전광역시 중구 계룡로 765번길 16";
  // const brokerAddr = "대전광역시 중구 계룡로 846";
  const brokerAddr = "대전광역시 중구 선화로35번길 18-13";
  // const brokerAddr = "대전광역시 유성구 문화원로46번길 26";
  // const brokerAddr = "보람로96 2010동";

  return (
    <>
      <KakaoMapGeocoderComponent kakao={kakao} brokerAddr={brokerAddr} />
      <div>OfficeMap</div>
    </>
  )
}

export default OfficeMap