// UI Control
const headerHeight = document.querySelector('header').scrollHeight; // header 높이
const bottomHeight = document.querySelector('.bottom-bar').scrollHeight; // header 높이
const details = document.querySelector('.details'); // details 요소 저장
const section = document.querySelector('section .container'); // section .map-wrapper 요소 저장
section.style.height = `calc(100vh - ${headerHeight}px)`; // 100vh 에서 header 높이 빼기
details.style.bottom = `calc(${bottomHeight}px + 15px)`;

// 도서관 api 데이터 가공 2022년 이후 데이터 중 위도가 주어지는 데이터만 필터링
const lib_data = data.records;
const current = lib_data.filter((item) => {
  return item.데이터기준일자.split('-')[0] >= '2022' && item.위도 !== '';
});

// input click event
const input = document.querySelector('.search-bar input'); // input 요소 저장
const btn = document.querySelector('.search-bar button'); // button 요소 저장
const loading = document.querySelector('.loading'); // loading 요소 저장
const mapElmt = document.querySelector('#map'); // map 요소 저장

// 1. 처음 로딩 시 on 클래스 추가
loading.classList.add('on');

btn.addEventListener('click', function () {
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; // 초기 활성화 시 모든 details 요소 숨김
  mapElmt.innerHTML = ''; // 초기 활성화 시 모든 map 자식 요소 삭제

  const value = input.value;
  if (value === '') {
    alert('검색어를 입력해 주세요.');
    input.focus();
    return;
  }

  // 2. 버튼 클릭 시 on 클래스 추가
  // loading.classList.add('on');
}); // button 클릭 시 실행할 함수

input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    btn.click();
  }
}); // input에서 enter key 입력 시 실행할 함수

// ===================
//  NAVER MP API CODES
// ===================

navigator.geolocation.getCurrentPosition((position) => {
  // 현재위치 정보 가져오기
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;

  startLenderLocation(lat, lng);
});

function startLenderLocation(la, ln) {
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(la, ln),
    zoom: 14,
  });

  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(la, ln),
    map: map,
  });

  current.forEach((item) => {
    // console.log(item.위도, item.경도);
    let latLng = new naver.maps.LatLng(item.위도, item.경도);

    // 화면 범위 내의 도서관만 마커로 표시
    let bounds = map.getBounds();

    if (bounds.hasLatLng(latLng)) {
      let marker = new naver.maps.Marker({
        position: latLng,
        map: map,
      });

      // 마커 정보
      let infoWindow = new naver.maps.InfoWindow({
        content: `
          <h4 style="padding:0.25rem; font-size:14px; font-weight:normal; color:#fff; background:#222; border-radius:6px;">${item.도서관명}</h4>
        `,
      });

      naver.maps.Event.addListener(marker, 'click', function () {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }

        const markerInfoData = {
          title: item.도서관명,
          itemCount: item['자료수(도서)'],
          serialItemCount: item['자료수(연속간행물)'],
          notBookItemCount: item['자료수(비도서)'],
          sitCount: item.열람좌석수,
          wdStart: item.평일운영시작시각,
          wdEnd: item.평일운영종료시각,
          wkStart: item.토요일운영시작시각,
          wkEnd: item.토요일운영종료시각,
          contact: item.도서관전화번호,
          address: item.소재지도로명주소,
          homePage: item.홈페이지주소,
        };

        getInfoOnMakder(markerInfoData);
      });
    }
  }); // end of current forEach method

  // 3. 모든 지도 요소가 추가 완료되면 on 클래스 제거
  loading.classList.remove('on');
}

function getInfoOnMakder(data) {
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; // 초기 활성화 시 모든 details 요소 숨김
  detailsWrapper.innerHTML = ''; // 초기 활성화 시 모든 details 자식 요소 삭제

  const infoElmt = `
    <div class="title">
    <h2>${data.title}</h2>
      <i class="ri-close-circle-fill"></i>
    </div>

    <div class="info">
      <!-- 중요 정보 -->
      <div class="boxinfo">
        <div class="red1">
          <h3>도서</h3>
          <h3>${data.itemCount}</h3>
        </div>
        <div class="red2">
          <h3>연속간행물</h3>
          <h3>${data.serialItemCount}</h3>
        </div>
        <div class="red3">
          <h3>비도서</h3>
          <h3>${data.notBookItemCount}</h3>
        </div>
        <div class="blue">
          <h3>열람좌석수</h3>
          <h3>${data.sitCount}</h3>
        </div>
      </div>
      <!-- 기본 정보 -->
      <div class="letterinfo">
        <div class="time">
          <div class="info-title">운영시간 :</div>
          <div class="info-contents">
            <p class="weekday">${data.wdStart} ~ ${data.wdEnd} (평일)</p>
            <p class="weekend">${data.wkStart} ~ ${data.wkEnd} (토요일 및 공휴일)</p>
            <p class="msg">* 공휴일 휴관</p>
          </div>
        </div>
        <div class="call">
          <div class="info-title">연락처 :</div>
          <div class="info-contents">
            <p class="call_each">${data.contact}</p>
          </div>
        </div>
        <div class="address">
          <div class="info-title">주소 :</div>
          <div class="info-contents">
            <p class="address_each">${data.address}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 홈페이지로 이동 -->
    <div class="link">
      <a href="${data.homePage}" class="#">홈페이지로 연결</a>
    </div>
  `;

  detailsWrapper.insertAdjacentHTML('beforeend', infoElmt);
  detailsWrapper.style.display = 'block';
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('ri-close-circle-fill')) {
    const detailsWrapper = document.querySelector('.details');
    detailsWrapper.style.display = 'none';
  }
});
