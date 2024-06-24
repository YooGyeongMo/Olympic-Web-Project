import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, remove, update } from "firebase/database";
import "./DataTable.css";

// DataTable 컴포넌트 정의
const DataTable = () => {
  // 상태 관리를 위한 useState 사용
  const [data, setData] = useState([]); // 데이터 목록 상태
  const [selectedRow, setSelectedRow] = useState(null); // 선택된 행 상태
  const [modalMessage, setModalMessage] = useState(""); // 모달 메시지 상태
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [details, setDetails] = useState(""); // 세부 정보 상태

  // 컴포넌트가 마운트 될 때 데이터를 가져오는 useEffect
  useEffect(() => {
    fetchData();
  }, []);

  // 데이터를 가져오는 함수
  const fetchData = () => {
    // Firebase 참조 정의
    const reportsRef = ref(database, "Reports");
    const locationsRef = ref(database, "Locations");
    const thiefsRef = ref(database, "Thiefs");

    // 각 데이터 소스에서 프로미스를 생성하여 데이터를 가져옴.
    const reportsPromise = new Promise((resolve) => {
      onValue(reportsRef, (snapshot) => {
        resolve(snapshot.val());
      });
    });

    const locationsPromise = new Promise((resolve) => {
      onValue(locationsRef, (snapshot) => {
        resolve(snapshot.val());
      });
    });

    const thiefsPromise = new Promise((resolve) => {
      onValue(thiefsRef, (snapshot) => {
        resolve(snapshot.val());
      });
    });
    // 모든 데이터 소스에서 가져온 데이터를 결합
    Promise.all([reportsPromise, locationsPromise, thiefsPromise]).then(
      (values) => {
        const [reports, locations, thiefs] = values;
        const combinedData = [];
        // 결합 로직을 실행하여 최종 데이터를 설정
        const reportMap = {};
        for (let id in reports) {
          reportMap[id] = {
            ...reports[id],
            reportID: id,
            latitude: null,
            longitude: null,
            stolen_things: null,
            gender: null,
            race: null,
            shave: null,
            glasses: null,
            body_length: null,
            body_size: null,
            scale: null,
          };
        }
        for (let id in locations) {
          const reportID = locations[id].reportID;
          if (reportMap[reportID]) {
            reportMap[reportID] = {
              ...reportMap[reportID],
              latitude: locations[id].latitude,
              longitude: locations[id].longitude,
              locID: id,
            };
          } else {
            reportMap[reportID] = {
              reportID: reportID,
              latitude: locations[id].latitude,
              longitude: locations[id].longitude,
              locID: id,
              stolen_things: null,
              gender: null,
              race: null,
              shave: null,
              glasses: null,
              body_length: null,
              body_size: null,
              scale: null,
            };
          }
        }
        for (let id in thiefs) {
          const reportID = thiefs[id].reportID;
          if (reportMap[reportID]) {
            reportMap[reportID] = {
              ...reportMap[reportID],
              stolen_things: thiefs[id].stolen_things,
              gender: thiefs[id].gender,
              race: thiefs[id].race,
              shave: thiefs[id].shave,
              glasses: thiefs[id].glasses,
              body_length: thiefs[id].body_length,
              body_size: thiefs[id].body_size,
              scale: thiefs[id].scale,
              thiefID: id,
            };
          } else {
            reportMap[reportID] = {
              reportID: reportID,
              latitude: null,
              longitude: null,
              stolen_things: thiefs[id].stolen_things,
              gender: thiefs[id].gender,
              race: thiefs[id].race,
              shave: thiefs[id].shave,
              glasses: thiefs[id].glasses,
              body_length: thiefs[id].body_length,
              body_size: thiefs[id].body_size,
              scale: thiefs[id].scale,
              thiefID: id,
            };
          }
        }
        for (let key in reportMap) {
          combinedData.push(reportMap[key]);
        }
        setData(combinedData);
      }
    );
  };
  // 행의 'accept' 상태를 토글하는 함수
  const handleAcceptChange = (row) => {
    const updatedRow = { ...row, accept: !row.accept };
    const reportRef = ref(database, `Reports/${row.reportID}`);

    update(reportRef, { accept: updatedRow.accept }).then(() => fetchData());
  };
  // 행을 클릭할 때 실행되는 함수로, 선택된 행을 상태에 저장
  const handleRowClick = (row) => {
    setSelectedRow(row);
  };
  // 선택된 행을 삭제하는 함수
  const handleDelete = () => {
    const reportRef = ref(database, `Reports/${selectedRow.reportID}`);
    const locationRef = ref(database, `Locations/${selectedRow.locID}`);
    const thiefRef = ref(database, `Thiefs/${selectedRow.thiefID}`);
    // 관련된 모든 데이터를 삭제하고 데이터를 새로 가져옴
    remove(reportRef).then(() => fetchData());
    remove(locationRef).then(() => fetchData());
    remove(thiefRef).then(() => fetchData());

    setSelectedRow(null);
  };

  // 세부 정보를 모달로 표시하는 함수
  const handleDetailsClick = (reportID) => {
    const reportRef = ref(database, `Reports/${reportID}`);
    onValue(
      reportRef,
      (snapshot) => {
        const report = snapshot.val();
        if (report && report.ReportsDetail) {
          setDetails(report.ReportsDetail);
          setModalMessage(`Details: ${report.ReportsDetail}`);
        } else {
          setModalMessage(`Details not found.`);
        }
        setShowModal(true);
      },
      {
        onlyOnce: true,
      }
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setDetails("");
  };
  // 테이블에서 표시할 데이터를 필터링하는 부분
  const notAcceptedData = data.filter((item) => !item.accept);
  const acceptedData = data.filter((item) => item.accept);

  // UI 컴포넌트 반환 부분
  return (
    <div className="table-container">
      <h3>승인 처리 필요</h3>
      <div className="table-wrapper">
        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Timestamp</th>
                <th>위도</th>
                <th>경도</th>
                <th>도난당한 물품</th>
                <th>성별</th>
                <th>인종</th>
                <th>수염 유무</th>
                <th>안경 유무</th>
                <th>키</th>
                <th>덩치</th>
                <th>세부내용</th>
                <th>Accept</th>
              </tr>
            </thead>
            <tbody>
              {notAcceptedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row)}
                  style={{
                    backgroundColor:
                      selectedRow && selectedRow.reportID === row.reportID
                        ? "lightblue"
                        : "white",
                  }}
                >
                  <td>{row.reportID}</td>
                  <td>{row.timestamp}</td>
                  <td>{row.latitude}</td>
                  <td>{row.longitude}</td>
                  <td>{row.stolen_things}</td>
                  <td>{row.gender}</td>
                  <td>{row.race}</td>
                  <td>{row.shave === "수염 있음" ? "수염 있음" : "수염 없음"}</td>
                  <td>{row.glasses === "안경 착용" ?  "안경 착용" : "안경 미착용"}</td>
                  <td>{row.body_length}</td>
                  <td>{row.body_size}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailsClick(row.reportID);
                      }}
                    >
                      세부내용 보기
                    </button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.accept}
                      onChange={() => handleAcceptChange(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3>승인 처리 완료</h3>
      <div className="table-wrapper">
        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Timestamp</th>
                <th>위도</th>
                <th>경도</th>
                <th>도난당한 물품</th>
                <th>성별</th>
                <th>인종</th>
                <th>수염 유무</th>
                <th>안경 유무</th>
                <th>키</th>
                <th>덩치</th>
                <th>세부내용</th>
                <th>Accept</th>
              </tr>
            </thead>
            <tbody>
              {acceptedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row)}
                  style={{
                    backgroundColor:
                      selectedRow && selectedRow.reportID === row.reportID
                        ? "lightblue"
                        : "white",
                  }}
                >
                  <td>{row.reportID}</td>
                  <td>{row.timestamp}</td>
                  <td>{row.latitude}</td>
                  <td>{row.longitude}</td>
                  <td>{row.stolen_things}</td>
                  <td>{row.gender}</td>
                  <td>{row.race}</td>
                  <td>{row.shave === "수염 있음" ? "수염 있음" : "수염 없음"}</td>
                  <td>{row.glasses === "안경 착용" ?  "안경 착용" : "안경 미착용"}</td>
                  <td>{row.body_length}</td>
                  <td>{row.body_size}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailsClick(row.reportID);
                      }}
                    >
                      세부내용 보기
                    </button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.accept}
                      onChange={() => handleAcceptChange(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions">
        {selectedRow && (
          <button onClick={handleDelete} className="delete">
            Delete
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button className="modal-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; //컴포넌트를 내보냄.
