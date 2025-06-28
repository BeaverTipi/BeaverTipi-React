import React, { useEffect } from 'react'
import KakaoMapGeocoderComponent from '../components/KakaoMapGeocoderComponent';

const { kakao } = window;
function OfficeMap() {
  useEffect(() => {
    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(36.325267, 127.408667),
      level: 1
    };
    const map = new kakao.maps.Map(container, options);
  }, [])
  return (
    <>
      <div>OfficeMap</div>
      <div id={"map"} style={{ width: "1200px", height: "800px" }}></div>
      { }
      <KakaoMapGeocoderComponent />
    </>
  )
}

export default OfficeMap