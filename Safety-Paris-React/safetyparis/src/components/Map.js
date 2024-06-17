import React, { useEffect } from "react";
import "./Map.css";

const Map = () => {
  useEffect(() => {
    // 스크립트 로드 함수
    const loadScript = (url) => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true; // 비동기 로딩 설정
      script.onload = console.log("Google Maps script loaded.");
      script.src = url;
      document.head.appendChild(script);
    };

    // initMap 함수
    const initMap = () => {
      new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8575, lng: 2.3514 },
        zoom: 13,
      });
    };

    // Google Maps 스크립트 로드
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyCxCjOgsPDF__iNago8obFLPRIgotaAjsA&callback=initMap`
    );
    window.initMap = initMap; // 전역 네임스페이스에 initMap을 할당합니다.
  }, []);

  return <div id="map"></div>;
};

export default Map;
