import React, { useState, useEffect, useCallback } from "react";
import { database } from "../firebase";
import { ref, push } from "firebase/database";
import { geocodeAddress } from "../geocode"; // Geocoding 함수 임포트
import "./Map.css";

const Map = () => {
  const [markerMode, setMarkerMode] = useState(false);
  const [marker, setMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(""); // address 상태 추가
  const apiKey = "AIzaSyCxCjOgsPDF__iNago8obFLPRIgotaAjsA"; // API 키 설정

  useEffect(() => {
    const initMap = () => {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: 48.8575, lng: 2.3514 },
          zoom: 13,
        }
      );
      setMap(mapInstance);
    };

    const loadScript = (url, callback) => {
      const scriptExists = document.querySelector(`script[src="${url}"]`);
      if (!scriptExists) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.async = true;
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
          initMap();
        } else {
          console.error("Google Maps API failed to load.");
        }
      }
    );
  }, [apiKey]); // 의존성 배열이 비어있어 맵 초기화는 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  const placeMarker = useCallback(
    (location, mapInstance) => {
      if (marker) {
        marker.setPosition(location); // 기존 마커의 위치를 업데이트
      } else {
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
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
      // markerMode가 true일 때만 리스너를 추가
      clickListener = map.addListener("click", (e) => {
        console.log("Map clicked, Marker Mode:", markerMode);
        placeMarker(e.latLng, map);
      });
    }

    // Cleanup 함수: 컴포넌트가 언마운트되거나 markerMode가 변경될 때 리스너를 제거
    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }, [map, markerMode, placeMarker]); // map과 markerMode가 변경될 때마다 실행

  const handleGeocode = async (e) => {
    e.preventDefault();
    try {
      const location = await geocodeAddress(address, apiKey);
      setLatitude(location.lat);
      setLongitude(location.lng);
      if (map) {
        placeMarker(
          new window.google.maps.LatLng(location.lat, location.lng),
          map
        );
      }
    } catch (error) {
      console.error("지오코딩 에러 : ", error);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const reportRef = ref(database, "Reports");
  //   const newReport = {
  //     latitude,
  //     longitude,
  //     description,
  //     timestamp: new Date().toISOString(),
  //   };
  //   push(reportRef, newReport).then(() => {
  //     setMarkerMode(false);
  //     setShowForm(false);
  //     setLatitude("");
  //     setLongitude("");
  //     setDescription("");
  //     if (marker) {
  //       marker.setMap(null);
  //       setMarker(null);
  //     }
  //   });
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportRef = ref(database, "Reports");
    const newReport = {
      accept: false,
      ReportsDetail: description,
      timestamp: new Date().toISOString(),
    };

    // Reports 테이블에 데이터 추가
    push(reportRef, newReport).then((reportSnapshot) => {
      const reportID = reportSnapshot.key; // 새로 생성된 reportID 가져오기

      const locationRef = ref(database, "Locations");
      const newLocation = {
        reportID: reportID,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      // Locations 테이블에 데이터 추가
      push(locationRef, newLocation).then(() => {
        const thiefRef = ref(database, "Thiefs");
        const newThief = {
          reportID: reportID,
          stolen_things: "Unknown", // 기본 값 또는 사용자 입력 값 사용
          gender: "Unknown", // 기본 값 또는 사용자 입력 값 사용
          race: "Unknown", // 기본 값 또는 사용자 입력 값 사용
          shave: "Unknown", // 기본 값 또는 사용자 입력 값 사용
          glasses: false, // 기본 값 또는 사용자 입력 값 사용
          body_length: 0.0, // 기본 값 또는 사용자 입력 값 사용
          body_size: "Unknown", // 기본 값 또는 사용자 입력 값 사용
          scale: 1, // 기본 값 또는 사용자 입력 값 사용
        };

        // Thiefs 테이블에 데이터 추가
        push(thiefRef, newThief).then(() => {
          setMarkerMode(false);
          setShowForm(false);
          setLatitude("");
          setLongitude("");
          setDescription("");
          if (marker) {
            marker.setMap(null);
            setMarker(null);
          }
        });
      });
    });
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setMarkerMode((prev) => !prev);
    if (!markerMode && marker) {
      marker.setMap(null);
      setMarker(null);
    }
  };

  return (
    <div className="map-container">
      <div className="top-banner">
        <button onClick={toggleForm}>{showForm ? "취소" : "제보하기"}</button>
      </div>
      <div id="map"></div>
      <div className={`form-container ${showForm ? "open" : ""}`}>
        <button className="slide-button" onClick={toggleForm}>
          {showForm ? "<" : ">"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit}>
            <label>
              위도: <input type="text" value={latitude} readOnly />
            </label>
            <label>
              경도: <input type="text" value={longitude} readOnly />
            </label>
            <label>
              주소:{" "}
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button onClick={handleGeocode}>Geocode</button>
            </label>
            <label>
              설명:{" "}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <button type="submit">제출</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Map;
