# 🚨 Safety-Paris

### 파리 올림픽 기간을 기반으로 서비스를 시작하여 파리 지역 범죄 예방을 위한 범죄 위험구역 알림 웹 서비스

## 📌목차

- [개요](#개요)
- [개발 기간](#개발-기간)
- [개발 멤버](#개발-멤버)
- [개발 환경](#개발-환경)
- [개발 도구](#개발-도구)
- [필요 라이브러리](#필요-라이브러리)
- [사용법](#사용법)
- [주요 기능](#주요-기능)
- [프로젝트 구성 요소](#프로젝트-구성-요소)

## 🔍 개요

### 우리는 2024년 파리 올림픽 개최에 앞서 해당 국가의 치안에 대해 주목하였다.

#### <br/>파리는 세계적인 관광 도시로 치안에 대한 중요성이 높아 당국의 정부 및 경찰 또한 범죄율을 낮추기 위한 노력을 많이 하고 있다. 그러나 최근 몇 년간, 파리를 비롯한 프랑스 전역에서 경범죄 사건이 증가하는 추세를 보이고 있다.

#### 특히, 특정 인종에 대한 소매치기, 주택 절도, 차량 절도 등의 사례가 두드러지며, 이는 지역축제와 대규모 이벤트를 향한 관광객의 증가와도 관련이 있음이 분명하다.

## 📆 개발 기간

### 해당 프로젝트는 2024년 3월 1일부터 2024년 6월 23일까지 약 4개월 동안 진행되었습니다.

## 👨‍💻 개발 멤버

### 유경모 성준영 서세환 김은석

## 🖥 개발 환경

- <img src="https://img.shields.io/badge/Node.js-%23339933?style=for-the-badge&logo=node.js&logoColor=white"> v18.20.3
- <img src="https://img.shields.io/badge/npm-%23CB3837?style=for-the-badge&logo=npm&logoColor=white"> v10.7.0
- <img src="https://img.shields.io/badge/Visual_Studio_Code-%23007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white">
- <img src="https://img.shields.io/badge/Google_Chrome-%234285F4?style=for-the-badge&logo=google-chrome&logoColor=white">

## 🛠 개발 도구

- <img src="https://img.shields.io/badge/HTML-%23E34F26?style=for-the-badge&logo=html5&logoColor=white"><img src="https://img.shields.io/badge/CSS-%231572B6?style=for-the-badge&logo=css3&logoColor=white"><img src="https://img.shields.io/badge/JS-%23F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
- <img src="https://img.shields.io/badge/React-%2361DAFB?style=for-the-badge&logo=React&logoColor=white">
- <img src="https://img.shields.io/badge/Firebase-%23039BE5?style=for-the-badge&logo=firebase">
- <img src="https://img.shields.io/badge/Google_Maps_API-%234285F4?style=for-the-badge&logo=google-maps&logoColor=white">
- <img src="https://img.shields.io/badge/Geolocation_API-%23424242?style=for-the-badge&logo=javascript&logoColor=white">
- <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white">

## ⚙️ 필요 라이브러리

- npm sweetalert2
- npm react-icons

## 📑 사용법

1. 로컬에 Git Clone 해온다.
2. npm과 node.js 버전을 확인한다.
3. package.lock과 node 모듈을 확인한다.
4. 필요 라이브러리들을 프로젝트 루트 폴더에 설치한다.
5. 프로젝트 루프 폴더에서 npm start 한다.

## 💡 주요 기능

### 👮‍♀️ 관리자

- 사용자들이 제보한 정보를 필터링 후 accept 체크하여 실제 지도에 마커 찍히게 하기

### 👨‍💼 사용자

- 범죄 제보하기(지도에 마커 찍기)
- 범죄 확인하기(지도 마커 확인)
- 범죄 정보 확인하기(지도 마커 클릭)
- 도움받기(대사관,경찰서 정보 제공)

## 📈 프로젝트 구성 요소

- App.js - 애플리케이션의 루트 컴포넌트로서 라우팅과 상태 관리를 담당

- AdminPage.js - 관리자 페이지 컴포넌트로, DataTable.js와 상호작용하여 데이터를 관리하고 표시

- UserPage.js - 일반 사용자 페이지 컴포넌트로, Map.js를 사용하여 위치 기반 서비스를 제공

- Map.js - 지도 및 위치 관련 기능을 제공하는 컴포넌트

- DataTable.js - 데이터를 표시하고 관리하는 기능을 제공하는 컴포넌트

- index.js - 애플리케이션의 진입점으로, App.js를 마운트하고 초기 설정을 담당

- reportWebVitals.js - 웹 애플리케이션의 성능 측정 기능을 제공하는 스크립트 파일

- firebase.js - Firebase 서비스 설정과 초기화를 담당하는 구성 파일

- geocode.js - 주소와 좌표 간의 변환 기능을 제공하는 유틸리티 스크립트

- .gitignore - Git 버전 관리에서 제외할 파일 목록을 지정하는 설정 파일

- package.json, package-lock.json - npm 프로젝트 설정 및 의존성 관리 파일

- node_modules - npm을 통해 설치된 모듈을 포함하는 디렉터리

- firebase.json, .firebaserc - Firebase 프로젝트 설정 및 환경 구성 파일
