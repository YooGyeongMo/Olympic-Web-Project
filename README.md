# 🚨 Safety-Paris

### 파리 올림픽 기간을 기반으로 서비스를 시작하여 파리 지역 범죄 예방을 위한 범죄 위험구역 알림 웹 서비스

## 📌목차

- [개요](#-개요)
- [개발 기간](#-개발-기간)
- [개발 멤버](#-개발-멤버)
- [개발 환경](#-개발-환경)
- [개발 도구](#-개발-도구)
- [필요 라이브러리](#-필요-라이브러리)
- [사용법](#-사용법)
- [주요 기능](#-주요-기능)
- [프로젝트 구성 요소](#-프로젝트-구성-요소)

## 🔍 개요

### "Safety Paris"는 2024 파리 올림픽을 기점으로 시작된 범죄 예방 및 정보 공유 서비스입니다.

"Safety Paris"를 통해 한국인 사용자들은 범죄 발생 정보를 제보하고, 범죄자의 특징, 상세한 사건 설명, 위치 정보를 공유할 수 있습니다.

제보된 정보는 검증 과정을 거쳐 다른 사용자들에게 실시간으로 제공되어 범죄 예방에 기여합니다.

## 📆 개발 기간

### 2024년 3월 1일 ~ 2024년 6월 23일

### 약 4개월 동안 진행되었습니다.

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

- 사용자들이 제보한 정보 확인

- 사용자들이 제보한 정보 관리(CRUD)

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
