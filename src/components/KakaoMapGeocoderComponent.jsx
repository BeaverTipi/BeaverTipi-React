import React, { useEffect, useRef, useState } from 'react';
import { useAxios } from '../hooks/useAxios';

const CATEGORIES = [
  { name: '카페', code: 'CE7', icon: '/images/kakaoMarkers/coffee.png' },
  { name: '편의점', code: 'CS2', icon: '/images/kakaoMarkers/convenience.png' },
  { name: '음식점', code: 'FD6', icon: '/images/kakaoMarkers/restaurant.png' },
  { name: '약국', code: 'PM9', icon: '/images/kakaoMarkers/pharmacy.png' },
  { name: '병원', code: 'HP8', icon: '/images/kakaoMarkers/hospital.png' },
  { name: '은행', code: 'BK9', icon: '/images/kakaoMarkers/bank.png' }
];



function KakaoMapGeocoderComponent({ kakao, brokerAddr, radius }) {

  const mapContainerRef = useRef(null);
  const [stats, setStats] = useState({});
  const [isKakaoMapsLoaded, setIsKakaoMapsLoaded] = useState(false);
  const axios = useAxios();
  const arr = [
    { "name": "대덕인", "address": "대전 중구 계룡로 846" },
    { "name": "김아린", "address": "대전 중구 계룡로 765번길 16" },
    { "name": "이학범", "address": "대전 중구 선화로35번길 18-13" }
  ];
  const [lstgList, setLstgList] = useState(arr);

  useEffect(() => {
    axios.get('/lstg/list') // 예: { "김아린": "주소", ... } 라면 아래에서 가공
      .then(data => {
        const arr = Object.entries(data).map(([name, address]) => ({ name, address }));
        setLstgList(arr);
      })
      .catch(err => console.error('매물 데이터 실패', err));
  }, [axios]);

  useEffect(() => {
    if (!lstgList.length) {
      console.log("마이오피스의 매물 리스트가 로딩되지 않았습니다.");
      return;
    }
    //KakaoMap SDK가 로딩됐는지 확인함.
    if (!kakao || !kakao.maps || !kakao.maps.load) {
      console.error("카카오맵 SDK가 로딩되지 않았습니다.");
      return;
    }
    kakao.maps.load(() => {
      //첫 위치 지정: 중개사무소 주소
      const address = brokerAddr;
      //🔍 주소를 유혹하는 디지털 탐정
      const geocoder = new kakao.maps.services.Geocoder();
      //useState() 훅을 이용해, 지도가 실행될 때에만 UI로 출력되게끔 boolean타입 setting
      setIsKakaoMapsLoaded(true);
      //물리 주소를 경도/위도 좌표로 변환해줌.
      geocoder.addressSearch(address, function (result, status) {
        if (status !== kakao.maps.services.Status.OK) {
          //[조건절]: 물리 주소가 잘못된 형식일 때
          console.error('마이오피스의 주소를 좌표로 변환하지 못했습니다.', status);
          return;
        }
        //[조건절]: 물리 주소가 해석 가능한 형태로 주어졌을 때
        //중개사무소 위치를 좌표로 변환
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        //지도의 중심 좌표와 확대 레벨 설정
        const options = {
          center: coords,
          level: 2
        }
        //useRef() 훅으로 연결된 div에 지도 그리기
        const map = new kakao.maps.Map(mapContainerRef.current, options);
        //* 마커 지정하는 함수
        new kakao.maps.Marker({ map, position: coords, title: '내 사무소' });

        /*****************************************************************************/
        /*********************주변 시설 마커, 개수 리스트 추가************************/
        /*****************************************************************************/
        const places = new kakao.maps.services.Places();
        const categoryStats = {};

        CATEGORIES.forEach(({ name, code, icon }, i) => {
          setTimeout(() => {
            places.categorySearch(code, (data, status) => {
              if (status === kakao.maps.services.Status.OK) {
                categoryStats[name] = data.length;
                console.log("카카오맵 카테고리서치 체킁: data.length", data.length)
                data.forEach(place => {
                  createCategoryMarker({
                    kakao,
                    map,
                    lat: place.y,
                    lng: place.x,
                    title: place.place_name,
                    image: icon
                  });
                });
              } else {
                categoryStats[name] = 0;
              }

              // 모든 카테고리 검색 완료되면 통계 갱신
              if (Object.keys(categoryStats).length === CATEGORIES.length) {
                setStats(categoryStats);
                setIsKakaoMapsLoaded(true);
              }
            }, {
              location: coords,
              radius: radius,
            });
          }, i * 1000); // 딜레이로 rate limit 회피
        });
      });
    });
    //SDK 자체가 메모리에 오르지 못한 레드카드 상황
  }, [kakao, lstgList, brokerAddr, radius]);

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{ width: '1200px', height: '800px', border: '1px solid #ccc' }}
      >
        {!isKakaoMapsLoaded && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            width: '100%', height: '100%', backgroundColor: '#f0f0f0', color: '#666'
          }}>
            📡 Kakao 지도 SDK 로딩 중...
          </div>
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h4>🏪 인근 편의시설 통계 (반경 {radius / 1000}km 기준)</h4>
        <ul>
          {Object.entries(stats).map(([name, count]) => (
            <li key={name}>{name}: {count}곳</li>
          ))}
        </ul>
      </div>
    </>
  );
};


function createCategoryMarker({ kakao, map, lat, lng, title, image }) {
  const imageSize = new kakao.maps.Size(24, 24);
  const markerImage = new kakao.maps.MarkerImage(image, imageSize);

  return new kakao.maps.Marker({
    map,
    position: new kakao.maps.LatLng(lat, lng),
    title,
    image: markerImage
  })
}


// // Debounce 유틸 함수
// function debounce(func, delay) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// }

export default KakaoMapGeocoderComponent;
