import React, { useEffect } from "react";
import "./Map.css";

const Map = () => {
  useEffect(() => {
    // 전역 네임스페이스에 initMap을 할당
    window.initMap = () => {
      new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8575, lng: 2.3514 },
        zoom: 13,
      });
    };

    // 스크립트 로드 함수
    const loadScript = (url) => {
      const scriptExists = document.querySelector(`script[src="${url}"]`);
      if (!scriptExists) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.async = true;
        script.onload = () => console.log("Google Maps API 로드 완료");
        document.head.appendChild(script);
      }
    };

    // Google Maps 스크립트 로드
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyCxCjOgsPDF__iNago8obFLPRIgotaAjsA&callback=initMap`
    );
  }, []);

  return <div id="map"></div>;
};

export default Map;
