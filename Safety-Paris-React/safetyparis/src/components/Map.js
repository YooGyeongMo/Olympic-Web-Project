import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { database } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { FaPaperPlane } from "react-icons/fa";
import { MdOutlineLocalPolice } from "react-icons/md";
import { IoIosHelpCircle } from "react-icons/io";
import Swal from "sweetalert2";
import "./Map.css";

const Map = () => {
  const [markerMode, setMarkerMode] = useState(false); // 마커 모드 상태 (마커 추가 모드인지 여부)
  const [marker, setMarker] = useState(null); // 현재 마커 객체를 저장하는 상태
  const [map, setMap] = useState(null); // 지도 객체를 저장하는 상태
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부 상태
  const [latitude, setLatitude] = useState(""); // 선택된 위치의 위도를 저장하는 상태
  const [longitude, setLongitude] = useState(""); // 선택된 위치의 경도를 저장하는 상태
  const [description, setDescription] = useState(""); // 범죄에 대한 설명을 저장하는 상태
  const [stolenThings, setStolenThings] = useState(""); // 도난당한 물품에 대한 정보를 저장하는 상태
  const [gender, setGender] = useState(""); // 범인의 성별을 저장하는 상태
  const [race, setRace] = useState(""); // 범인의 인종을 저장하는 상태
  const [shave, setShave] = useState(false); // 범인의 수염 유무를 저장하는 상태
  const [glasses, setGlasses] = useState(false); // 범인의 안경 착용 여부를 저장하는 상태
  const [bodyLength, setBodyLength] = useState(""); // 범인의 키 정보를 저장하는 상태
  const [bodySize, setBodySize] = useState(""); // 범인의 체형 정보를 저장하는 상태
  const [scale, setScale] = useState(""); // 범죄에 관련된 인원 수를 저장하는 상태
  const [descriptionCharCount, setDescriptionCharCount] = useState(0); // 입력된 설명의 문자 수를 계산하는 상태
  const [currentStep, setCurrentStep] = useState(1); // 제보하기 폼의 현재 단계를 저장하는 상태
  const [markers, setMarkers] = useState([]); // Firebase에서 가져온 마커 데이터를 저장하는 상태
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // 환경 변수에서 구글 맵스 API 키를 가져오는 상태
  const [address, setAddress] = useState(""); // 선택된 위치의 주소를 저장하는 상태
  const [isFormOpen, setFormOpen] = useState(false); // 상세 정보 폼의 표시 여부를 저장하는 상태
  const [selectedAddress, setSelectedAddress] = useState(""); // 선택된 주소를 저장하는 상태
  const [reportDetails, setReportDetails] = useState(null); // 선택된 보고서의 상세 정보를 저장하는 상태

  const fetchReportDetails = useCallback((reportId) => {
    // 지정된 reportId를 사용하여 위치 정보 참조를 생성한다.
    const locationRef = ref(database, `Locations/${reportId}`); // 위치 정보에 대한 실시간 업데이트를 수신한다.
    onValue(locationRef, (locationSnapshot) => {
      // 스냅샷에서 위치 데이터를 추출한다.
      const locationData = locationSnapshot.val(); // 위치 데이터와 연결된 보고서 ID가 있는지 확인한다.
      if (locationData && locationData.reportID) {
        // 연결된 보고서 ID를 사용하여 보고서 세부 정보 참조를 생성한다.
        // 보고서 세부 정보 가져오기
        const reportRef = ref(database, `Reports/${locationData.reportID}`); // 보고서 세부 정보에 대한 실시간 업데이트를 수신한다.
        onValue(reportRef, (reportSnapshot) => {
          // 스냅샷에서 보고서 데이터를 추출한다.
          const reportData = reportSnapshot.val();

          // 도둑에 대한 정보를 저장하고 있는 레퍼런스를 생성한다.
          const thiefRef = ref(database, `Thiefs`);
          onValue(thiefRef, (thiefSnapshot) => {
            // 도둑 정보에 대한 실시간 업데이트를 수신한다.
            const thiefs = thiefSnapshot.val();
            const thiefData = Object.values(thiefs).find(
              (thief) => thief.reportID === locationData.reportID
            );
            // 도둑 데이터가 존재하면 상태를 업데이트
            if (thiefData) {
              setReportDetails({
                ...reportData,
                ...locationData,
                ...thiefData,
              });
            } else {
              console.error("Error: Thief 데이터 오류");
            }
          });
        });
      } else {
        console.error("Error: Location 혹은 Report 데이터 오류.");
      }
    });
  }, []); // 이 콜백은 의존성 배열이 비어 있으므로 컴포넌트가 마운트될 때 한 번만 생성

  // 'openForm' 함수는 특정 주소와 보고서 ID를 인자로 받아 처리하는데, useCallback 훅을 사용하여 메모이제이션.
  const openForm = useCallback(
    (address, reportId) => {
      setSelectedAddress(address);
      fetchReportDetails(reportId);
      setFormOpen(true);
    },
    [fetchReportDetails]
  );
  // 'closeForm' 함수는 폼을 닫고 관련 상태를 초기화
  const closeForm = () => {
    setFormOpen(false);
    setSelectedAddress("");
  };

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
      const reportsData = snapshot.val(); // 데이터베이스 스냅샷에서 값을 추출
      if (reportsData) {
        // 승인된 보고서만 필터링
        const acceptedReports = Object.keys(reportsData)
          .filter((key) => reportsData[key].accept)
          .map((key) => ({
            id: key,
            ...reportsData[key],
          }));

        // Firebase의 "Locations" 참조에서 위치 데이터를 실시간으로 가져옴.
        const locationsRef = ref(database, "Locations");
        onValue(locationsRef, (snapshot) => {
          const locationsData = snapshot.val(); // 위치 데이터 추출
          // 승인된 보고서에 해당하는 위치 데이터만 필터링하여 마커로 표시
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
            setMarkers(loadedMarkers); // 마커 상태 업데이트
            console.log(loadedMarkers); // 콘솔에 로드된 마커 출력
          }
        });
      }
    });
  };
  // 첫 번째 useEffect: Google Maps 스크립트를 동적으로 로드
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
    // 스크립트를 로드하고 initMap 함수를 호출
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
  }, [apiKey]); // apiKey 변화에 의존

  // 두 번째 useEffect: 지도 객체(map)와 마커(markers) 배열이 있을 때 마커를 지도에 추가
  useEffect(() => {
    if (map) {
      markers.forEach((markerData) => {
        const position = new window.google.maps.LatLng(
          markerData.latitude,
          markerData.longitude
        );

        const newMarker = new window.google.maps.Marker({
          position: { lat: markerData.latitude, lng: markerData.longitude },
          map: map,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // 빨간색 마커 이미지
            size: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32),
          },
        });

        const div = document.createElement("div");
        const root = ReactDOM.createRoot(div);
        const content = (
          <InfoWindowContent
            address={markerData.address}
            onOpenForm={openForm}
            reportId={markerData.id} // reportId 추가
          />
        );
        root.render(content);

        const infoWindow = new window.google.maps.InfoWindow({ content: div });

        newMarker.addListener("click", () => {
          map.panTo(position);
          infoWindow.open(map, newMarker);
        });
      });
    }
  }, [map, markers, openForm]); // map, markers, openForm 변경에 의존

  //컴포넌트 정의: 마커 클릭 시 표시되는 정보 창 컨텐츠
  const InfoWindowContent = ({ address, onOpenForm, reportId }) => {
    return (
      <div className="info-window-1">
        <div className="info-window-2">
          <MdOutlineLocalPolice
            className="marker-info-icon"
            style={{ marginRight: "8px" }}
          />
          <span className="marker-info-window-caution">위험지역</span>
        </div>
        <div className="info-window-3">
          <p className="marker-info-address">{address}</p>
          <button
            className="marker-info-btn"
            onClick={() => onOpenForm(address, reportId)}
          >
            자세히 보기
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (reportDetails) {
      // 데이터를 성공적으로 가져왔을 때 필요한 추가 작업 수행
      console.log(reportDetails);
    }
  }, [reportDetails]);

  // 마커 설정 함수: 사용자 클릭에 의해 지도에 새 마커를 추가합니다.
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
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: location }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            setAddress(results[0].formatted_address);
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    },
    [marker]
  );

  // 클릭 리스너 설정: 마커 모드가 활성화된 경우 지도 클릭 시 마커를 추가
  useEffect(() => {
    let clickListener;
    if (map && markerMode) {
      clickListener = map.addListener("click", (e) => {
        console.log("Map clicked, Marker Mode:", markerMode);
        placeMarker(e.latLng, map);
      });
    }
    // 클린업 함수: 컴포넌트 언마운트 시 리스너를 제거.
    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }, [map, markerMode, placeMarker]);

  // handleSubmit 함수는 폼 제출을 처리.
  const handleSubmit = (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작을 방지

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

    // 보고서 정보를 데이터베이스에 저장
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
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        };
        // 위치 정보를 저장.
        push(locationRef, newLocation).then(() => {
          const thiefRef = ref(database, "Thiefs");
          const newThief = {
            reportID: reportID,
            stolen_things: stolenThings || defaultStolenThings,
            gender: gender || defaultGender,
            race: race || defaultRace,
            shave: shave ? "수염있음" : "수염없음",
            glasses: glasses ? "안경 착용" : "안경 미착용",
            body_length: bodyLength || defaultBodyLength, // 문자열로 기본값 설정
            body_size: bodySize || defaultBodySize,
            scale: scale || defaultScale, // 문자열로 기본값 설정
          };

          console.log(newThief, newLocation, newReport); // 실제로 저장되는 값 확인
          // 도둑 정보를 저장
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
              text: "제보가 성공적으로 접수되었습니다.귀하의 관심에 진심으로 감사드립니다.",
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
  };

  // toggleForm 함수는 폼의 표시 상태를 토글
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
    setAddress(""); // 주소 초기화 추가
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
  // 제보 내용을 입력받는 폼의 입력 값을 상태로 저장.
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setDescription(value);
      setDescriptionCharCount(value.length);
    }
  };
  // 폼 제출 시 다음 단계로 진행
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // 컴포넌트의 반환 부분, UI 구성 요소를 렌더링.
  return (
    <div className="map-container">
      <div className="top-banner">
        <div className="logo-container">
          <button className="logo-button">Safety Paris</button>
        </div>
        <button className="report-btn" onClick={toggleForm}>
          <FaPaperPlane style={{ marginRight: "8px" }} />
          {showForm ? "취소 (마커를 지도에 선택하세요)" : "제보하기"}
        </button>
        {/* 도움 지원 버튼 추가 */}
        <a
          href="https://www.notion.so/2f329a3f820248bdb639936d65c9ce43"
          target="_blank"
          rel="noopener noreferrer"
          className="help-btn"
        >
          <IoIosHelpCircle
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px",
            }}
          />
          도움 지원
        </a>
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
      {/*마커 폼 */}
      {isFormOpen && (
        <div className="overlay">
          <div className="central-form">
            <div className="form-header">
              <h2>위치</h2>
            </div>
            <p className="detail-info-lo-data">{selectedAddress}</p>
            {reportDetails && (
              <div>
                <h2>인상착의</h2>
                <div className="detail-info-category2">
                  <div className="detail-info-category">
                    <p className="detail-info-kind">성별:</p>
                    <p className="detail-info-data">{reportDetails.gender}</p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">인종:</p>
                    <p className="detail-info-data"> {reportDetails.race}</p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">수염 유무:</p>
                    <p className="detail-info-data"> {reportDetails.shave}</p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">안경 유무:</p>
                    <p className="detail-info-data"> {reportDetails.glasses}</p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">키:</p>
                    <p className="detail-info-data">
                      {reportDetails.body_length}
                    </p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">체형:</p>
                    <p className="detail-info-data">
                      {reportDetails.body_size}
                    </p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">범인의 인원 수:</p>
                    <p className="detail-info-data"> {reportDetails.scale}</p>
                  </div>
                </div>
                <h2>상세한 설명</h2>
                <div className="detail-info-category2">
                  <div className="detail-info-category">
                    <p className="detail-info-kind">도난 품목: </p>
                    <p className="detail-info-data">
                      {reportDetails.stolen_things}
                    </p>
                  </div>
                  <div className="detail-info-category">
                    <p className="detail-info-kind">상세 내용:</p>
                    <p className="detail-info-data">
                      {reportDetails.ReportsDetail}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="close-btn-container">
              <button className="close-btn" onClick={closeForm}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map; // 컴포넌트 내보내기
