import React, { useEffect, useRef, useState } from 'react';

function KakaoMapGeocoderComponent({ kakao, brokerAddr }) {

  const mapContainerRef = useRef(null);
  const [isKakaoMapsLoaded, setIsKakaoMapsLoaded] = useState(false);


  useEffect(() => {

    //KakaoMap SDK가 로딩됐는지 확인함.
    if (kakao && kakao.maps && kakao.maps.load) {

      window.kakao.maps.load(() => {
        //첫 위치 지정: 중개사무소 주소
        const address = brokerAddr;
        //🔍 주소를 유혹하는 디지털 탐정
        const geocoder = new kakao.maps.services.Geocoder();
        console.log("응 로딩 됐구 실행할게~^0^ 2트");

        //useState() 훅을 이용해, 지도가 실행될 때에만 UI로 출력되게끔 boolean타입 setting
        setIsKakaoMapsLoaded(true);

        //물리 주소를 경도/위도 좌표로 변환해줌.
        geocoder.addressSearch(address, function (result, status) {
          //[조건절]: 물리 주소가 해석 가능한 형태로 주어졌을 때
          if (status === kakao.maps.services.Status.OK) {
            //중개사무소 위치를 좌표로 변환
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            //지도의 중심 좌표와 확대 레벨 설정
            const options = {
              center: /*new kakao.maps.LatLng(36.325267, 127.408667),*/ coords,
              level: 1
            }
            //useRef() 훅으로 연결된 div에
            const map = new kakao.maps.Map(mapContainerRef.current, options);

            //* 마커 지정하는 함수
            new kakao.maps.Marker({ map, position: coords });
            //[조건절]: 물리 주소가 잘못된 형식일 때
          } else {
            console.error('주소 변환 실패:', status);
          }
        });
      });
      //SDK 자체가 메모리에 오르지 못한 레드카드
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
