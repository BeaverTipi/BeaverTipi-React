import React, { useEffect, useRef, useState } from 'react';

function KakaoMapGeocoderComponent() {
  const mapContainerRef = useRef(null);
  const [isKakaoMapsLoaded, setIsKakaoMapsLoaded] = useState(false);
  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      console.log("응 로딩 됐구 실행할게~^0^");
      const address = "서울특별시 중구 세종대로 110";
      const geocoder = new window.kakao.maps.services.Geocoder();
      window.kakao.maps.load(() => {
        console.log("응 로딩 됐구 실행할게~^0^ 2트");
        setIsKakaoMapsLoaded(true);
        geocoder.addressSearch(address, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            const map = new window.kakao.maps.Map(mapContainerRef.current, {
              center: coords,
              level: 3
            });
            new window.kakao.maps.Marker({ map, position: coords });
          } else {
            console.error('주소 변환 실패:', status);
          }
        });
      });

    } else {
      console.error("카카오맵 SDK가 로딩되지 않았습니다.");
    }


  }, []);
  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ width: '1200px', height: '800px', border: '1px solid #ccc' }}
    >
      {!isKakaoMapsLoaded && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: '100%', height: '100%', backgroundColor: '#f0f0f0', color: '#666'
        }}>
          Kakao 지도 SDK 로딩 중...
        </div>
      )}
    </div>
  );
};

export default KakaoMapGeocoderComponent;
