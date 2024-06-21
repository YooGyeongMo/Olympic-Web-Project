import React, { useState, useEffect, useCallback } from "react";
import { database } from "../firebase";
import { ref, push } from "firebase/database";
import { FaPaperPlane } from "react-icons/fa";
import "./Map.css";

// Text 컴포넌트 정의
const Text = ({ children }) => (
  <span className="logo-text-image">{children}</span>
);

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
  const apiKey = "AIzaSyCxCjOgsPDF__iNago8obFLPRIgotaAjsA";

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
  };

  useEffect(() => {
    const loadScript = (url, callback) => {
      const scriptExists = document.querySelector(`script[src="${url}"]`);
      if (!scriptExists) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = callback;
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
        } else {
          console.error("Google Maps API failed to load.");
        }
      }
    );
  }, [apiKey]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const reportRef = ref(database, "Reports");
    const newReport = {
      accept: false,
      ReportsDetail: description,
      timestamp: new Date().toISOString(), // 현재 시각을 timestamp로 추가
    };

    push(reportRef, newReport).then((reportSnapshot) => {
      const reportID = reportSnapshot.key;

      const locationRef = ref(database, "Locations");
      const newLocation = {
        reportID: reportID,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      push(locationRef, newLocation).then(() => {
        const thiefRef = ref(database, "Thiefs");
        const newThief = {
          reportID: reportID,
          stolen_things: stolenThings,
          gender: gender,
          race: race,
          shave: shave ? "Yes" : "No",
          glasses: glasses,
          body_length: parseFloat(bodyLength),
          body_size: bodySize,
          scale: parseInt(scale, 10),
        };

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
  };

  return (
    <div className="map-container">
      <div className="top-banner">
        <div className="logo-container">
          <button className="logo-button">Safety Paris</button>
        </div>
        <button className="report-btn" onClick={toggleForm}>
          <FaPaperPlane style={{ marginRight: "8px" }} />
          {showForm ? "취소" : "제보하기"}
        </button>
      </div>
      <div id="map"></div>
      <div className={`form-container ${showForm ? "open" : ""}`}>
        <button className="slide-button" onClick={toggleForm}>
          {showForm ? "<" : ">"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit}>
            <label>
              설명:{" "}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              도난 품목:{" "}
              <input
                type="text"
                value={stolenThings}
                onChange={(e) => setStolenThings(e.target.value)}
              />
            </label>
            <label>
              성별:{" "}
              <label>
                <input
                  type="radio"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={(e) => setGender(e.target.value)}
                />
                남성
              </label>
              <label>
                <input
                  type="radio"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={(e) => setGender(e.target.value)}
                />
                여성
              </label>
            </label>
            <label>
              인종:{" "}
              <select value={race} onChange={(e) => setRace(e.target.value)}>
                <option value="">선택하세요</option>
                <option value="Asian">아시아인</option>
                <option value="Caucasian">백인</option>
                <option value="African">아프리카인</option>
                <option value="Hispanic">히스패닉</option>
              </select>
            </label>
            <label>
              수염:{" "}
              <input
                type="checkbox"
                checked={shave}
                onChange={(e) => setShave(e.target.checked)}
              />
            </label>
            <label>
              안경:{" "}
              <input
                type="checkbox"
                checked={glasses}
                onChange={(e) => setGlasses(e.target.checked)}
              />
            </label>
            <label>
              키:{" "}
              <input
                type="text"
                value={bodyLength}
                onChange={(e) => setBodyLength(e.target.value)}
              />
            </label>
            <label>
              체형:{" "}
              <input
                type="text"
                value={bodySize}
                onChange={(e) => setBodySize(e.target.value)}
              />
            </label>
            <label>
              범인의 인원 수:{" "}
              <input
                type="text"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              />
            </label>
            <button className="submit-btn" type="submit">
              제출
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Map;
