import React, { useState, useEffect, useCallback } from "react";
import { database } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { FaPaperPlane } from "react-icons/fa";
import { MdOutlineLocalPolice } from "react-icons/md";
import Swal from "sweetalert2";
import "./Map.css";

const Map = () => {
  const [markerMode, setMarkerMode] = useState(false);
  const [marker, setMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [stolenThings, setStolenThings] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [shave, setShave] = useState(false);
  const [glasses, setGlasses] = useState(false);
  const [bodyLength, setBodyLength] = useState("");
  const [bodySize, setBodySize] = useState("");
  const [scale, setScale] = useState(""); //범인 인원수
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1); // 제보하기 폼
  const [markers, setMarkers] = useState([]); // Firebase에서 가져온 마커 데이터 저장
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const geocoder = new window.google.maps.Geocoder();

  // 전역 스코프에서 initMap 함수 정의
  window.initMap = () => {
    const mapInstance = new window.google.maps.Map(
      document.getElementById("map"),
      {
        center: { lat: 48.8575, lng: 2.3514 },
        zoom: 13,
        disableDefaultUI: true, // 기본 UI 비활성화 옵션 추가
        styles: [],
      }
    );
    setMap(mapInstance);

    // POI 클릭 이벤트 막기
    mapInstance.addListener("click", function (event) {
      if (event.placeId) {
        event.stop();
      }
    });
    // Firebase에서 마커 데이터 가져오기
    const reportsRef = ref(database, "Reports");
    onValue(reportsRef, (snapshot) => {
      const reportsData = snapshot.val();
      if (reportsData) {
        const acceptedReports = Object.keys(reportsData)
          .filter((key) => reportsData[key].accept)
          .map((key) => ({
            id: key,
            ...reportsData[key],
          }));

        const locationsRef = ref(database, "Locations");
        onValue(locationsRef, (snapshot) => {
          const locationsData = snapshot.val();
          if (locationsData) {
            const loadedMarkers = Object.keys(locationsData)
              .filter((key) =>
                acceptedReports.some(
                  (report) => report.id === locationsData[key].reportID
                )
              )
              .map((key) => ({
                id: key,
                ...locationsData[key],
              }));
            setMarkers(loadedMarkers);
            console.log(loadedMarkers);
          }
        });
      }
    });
  };

  useEffect(() => {
    const loadScript = (url, callback) => {
      const scriptExists = document.querySelector(`script[src="${url}"]`);
      if (!scriptExists) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = callback;
        script.onerror = () => console.error("ScriptExists Error.");
        document.head.appendChild(script);
      } else {
        callback();
      }
    };

    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`,
      () => {
        if (window.google && window.google.maps) {
          window.initMap();
          console.log("성공");
        } else {
          console.error("Google Maps API failed to load.");
        }
      }
    );
  }, [apiKey]);

  useEffect(() => {
    if (map) {
      // 마커 추가
      markers.forEach((markerData) => {
        const newMarker = new window.google.maps.Marker({
          position: { lat: markerData.latitude, lng: markerData.longitude },
          map: map,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // 빨간색 마커 이미지
            size: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32),
          },
        });

        // 마커 클릭 이벤트 추가
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            `,
        });
        newMarker.addListener("click", () => {
          map.panTo(newMarker.getPosition());
          infoWindow.open(map, newMarker);
        });
      });
    }
  }, [map, markers]);

  const placeMarker = useCallback(
    (location, mapInstance) => {
      if (marker) {
        marker.setPosition(location);
      } else {
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // 파란색 마커 이미지
            size: new window.google.maps.Size(32, 32), // 마커 크기 설정
            anchor: new window.google.maps.Point(16, 32), // 마커 앵커 설정
          },
        });
        setMarker(newMarker);
      }
      setLatitude(location.lat().toFixed(6));
      setLongitude(location.lng().toFixed(6));
    },
    [marker]
  );

  useEffect(() => {
    let clickListener;
    if (map && markerMode) {
      clickListener = map.addListener("click", (e) => {
        console.log("Map clicked, Marker Mode:", markerMode);
        placeMarker(e.latLng, map);
      });
    }

    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }, [map, markerMode, placeMarker]);

  const geocodeLatLng = (lat, lng, callback) => {
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          callback(results[0].formatted_address);
        } else {
          callback("주소를 찾을 수 없습니다.");
        }
      } else {
        callback("지오코딩 실패: " + status);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    //마커가 찍히지 않은 경우
    if (!latitude || !longitude) {
      Swal.fire({
        title: "경고",
        text: "대략적인 위치를 지도에 찍어주세요.",
        icon: "warning",
      });
      return;
    }

    // 기본값 설정
    const defaultDescription = "설명 없음";
    const defaultStolenThings = "도난 품목 없음";
    const defaultGender = "성별 알 수없음";
    const defaultRace = "인종 알 수 없음";
    const defaultBodyLength = "범인 키 알 수 없음";
    const defaultBodySize = "범인 체형 알 수없음";
    const defaultScale = "범인들의 규모 알 수없음";

    geocodeLatLng(latitude, longitude, (address) => {
      const reportRef = ref(database, "Reports");
      const newReport = {
        accept: false,
        ReportsDetail: description || defaultDescription,
        timestamp: new Date().toISOString(), // 현재 시각을 timestamp로 추가
      };

      push(reportRef, newReport)
        .then((reportSnapshot) => {
          const reportID = reportSnapshot.key;

          const locationRef = ref(database, "Locations");
          const newLocation = {
            reportID: reportID,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address: address, // 지오코딩된 주소 추가
          };

          push(locationRef, newLocation).then(() => {
            const thiefRef = ref(database, "Thiefs");
            const newThief = {
              reportID: reportID,
              stolen_things: stolenThings || defaultStolenThings,
              gender: gender || defaultGender,
              race: race || defaultRace,
              shave: shave ? "Yes" : "No",
              glasses: glasses ? "Yes" : "No",
              body_length: bodyLength || defaultBodyLength, // 문자열로 기본값 설정
              body_size: bodySize || defaultBodySize,
              scale: scale || defaultScale, // 문자열로 기본값 설정
            };

            console.log(newThief, newLocation, newReport); // 실제로 저장되는 값 확인

            push(thiefRef, newThief).then(() => {
              setMarkerMode(false);
              setShowForm(false);
              setLatitude("");
              setLongitude("");
              setDescription("");
              setStolenThings("");
              setGender("");
              setRace("");
              setShave(false);
              setGlasses(false);
              setBodyLength("");
              setBodySize("");
              setScale("");
              if (marker) {
                marker.setMap(null);
                setMarker(null); //마커
              }
              // 성공 메시지 표시
              Swal.fire({
                title: "성공",
                text: "제보가 성공적으로 접수되었습니다.<br>귀하의 관심에 진심으로 감사드립니다.",
                icon: "success",
              }).then(() => {
                window.location.reload();
              });
            });
          });
        })
        .catch((error) => {
          // 에러 처리
          Swal.fire({
            title: "오류",
            text: `제보 중 오류가 발생했습니다:<br>${error.message}`,
            icon: "error",
          });
        });
    });
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setMarkerMode((prev) => !prev);
    if (marker) {
      marker.setMap(null);
      setMarker(null); // 마커 제거
    }
    // 폼 데이터 초기화
    setCurrentStep(1);
    setLatitude("");
    setLongitude("");
    setDescription("");
    setStolenThings("");
    setGender("");
    setRace("");
    setShave(false);
    setGlasses(false);
    setBodyLength("");
    setBodySize("");
    setScale("");
    setDescriptionCharCount(0); // 문자 수 초기화
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setDescription(value);
      setDescriptionCharCount(value.length);
    }
  };
  //폼 화면관리
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="map-container">
      {/* 로딩 스피너 */}
      <div className="top-banner">
        <div className="logo-container">
          <button className="logo-button">Safety Paris</button>
        </div>
        <button className="report-btn" onClick={toggleForm}>
          <FaPaperPlane style={{ marginRight: "8px" }} />
          {showForm ? "취소 (마커를 지도에 선택하세요)" : "제보하기"}
        </button>
      </div>
      <div id="map"></div>
      <div className={`form-container ${showForm ? "open" : ""}`}>
        <button className="slide-button" onClick={toggleForm}>
          {showForm ? "<" : ">"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit}>
            <div className="intro-title">제보하기</div>
            <div className="intro-text">
              Safety Paris는 파리에서 증가하는 범죄율로 인해 예방하고자 생긴
              서비스입니다.
              <br />
              <br />
              파리 올림픽을 기점으로 파리에서 발생하는 범죄 정보 를
              제보해주시면, 해당 정보를 활용해 사용자들에게 예방 정보를 제공할
              수 있습니다.
              <br />
              <br />
              제보해주신 정보는 추후 사용자들에게 유용한 정보를 제공하고 범죄
              예방에 큰 도움이 됩니다.
              <br />
              <br />
              제보에 참여해주셔서 진심으로 감사드립니다.
            </div>
            {/*제보하기 기능 섹션 1*/}
            {currentStep === 1 && (
              <div className="form-1">
                <div className="form-1-title">기억나는 인상착의</div>
                <div className="form-1-sub-description">
                  만약 인상착의가 기억 나시지 않으신다면 아래에 다음버튼을 눌러
                  주세요.
                </div>
                <div className="form-category">성별</div>
                <br />
                <label className="form-sex-male">
                  <input
                    type="radio"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  남성
                </label>
                <label className="form-sex-female">
                  <input
                    type="radio"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  여성
                </label>
                <div className="form-category">인종</div>
                <select
                  className="form-select"
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  <option value="Asian">아시아인</option>
                  <option value="Caucasian">백인</option>
                  <option value="African">아프리카인</option>
                  <option value="Hispanic">히스패닉</option>
                </select>
                <div className="form-feature-container">
                  <div className="form-feature-item">
                    <span className="form-feature-label">수염유무</span>
                    <input
                      type="checkbox"
                      checked={shave}
                      onChange={(e) => setShave(e.target.checked)}
                    />
                  </div>
                  <div className="form-feature-item">
                    <span className="form-feature-label">안경유무</span>
                    <input
                      type="checkbox"
                      checked={glasses}
                      onChange={(e) => setGlasses(e.target.checked)}
                    />
                  </div>
                </div>

                <div className="form-category">키</div>
                <br />
                <input
                  type="text"
                  className="input-height"
                  placeholder="기억나는 풍채나 덩치를 적어주세요."
                  value={bodyLength}
                  onChange={(e) => setBodyLength(e.target.value)}
                />
                <div className="form-category">체형</div>
                <br />
                <input
                  type="text"
                  className="input-weight"
                  placeholder="기억나는 대략적인 특징을 적어주세요."
                  value={bodySize}
                  onChange={(e) => setBodySize(e.target.value)}
                />

                <br />
                <div className="form-next-step-container">
                  <button
                    className="form-next-step-btn"
                    type="button"
                    onClick={nextStep}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {/* 제보하기 섹션 2*/}
            {currentStep === 2 && (
              <div className="form-2">
                <div className="form-category">도난 품목</div>
                <br />
                <input
                  type="text"
                  className="input-steal-things"
                  placeholder="도난당한 물품이 있으시다면 적어주세요."
                  value={stolenThings}
                  onChange={(e) => setStolenThings(e.target.value)}
                />
                <div className="form-category">범인의 인원 수</div>
                <br />
                <input
                  type="text"
                  className="input-scale"
                  placeholder="범인의 규모를 적어주세요."
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                />
                <div className="form-category">설명</div>
                <br />
                <textarea
                  placeholder="사용자분들에게 보다 정확한 예방 정보를 알리기 위해 범죄 상황을 최대한 상세히 기록해주시기를 부탁드립니다. 
                  힘든 상황에서도 도움을 주셔서 감사합니다."
                  className="crime-explain"
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength="500"
                  style={{ width: "100%", height: "150px" }}
                />
                <div className="discription-char-count">
                  문자 수: {descriptionCharCount}/500
                </div>
                <button
                  className="prevstep-btn"
                  type="button"
                  onClick={prevStep}
                >
                  이전
                </button>
                <button className="submit-btn" type="submit">
                  제출
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Map;

