import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, remove, update } from "firebase/database";
import "./DataTable.css";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const reportsRef = ref(database, "Reports");
    const locationsRef = ref(database, "Locations");
    const thiefsRef = ref(database, "Thiefs");

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

    Promise.all([reportsPromise, locationsPromise, thiefsPromise]).then(
      (values) => {
        const [reports, locations, thiefs] = values;
        const combinedData = [];

        const reportMap = {};
        for (let id in reports) {
          reportMap[reports[id].reportID] = { ...reports[id], id: id };
        }
        for (let id in locations) {
          if (reportMap[locations[id].reportID]) {
            reportMap[locations[id].reportID] = {
              ...reportMap[locations[id].reportID],
              ...locations[id],
              locID: id,
            };
          } else {
            reportMap[locations[id].reportID] = { ...locations[id], locID: id };
          }
        }
        for (let id in thiefs) {
          if (reportMap[thiefs[id].reportID]) {
            reportMap[thiefs[id].reportID] = {
              ...reportMap[thiefs[id].reportID],
              ...thiefs[id],
              thiefID: id,
            };
          } else {
            reportMap[thiefs[id].reportID] = { ...thiefs[id], thiefID: id };
          }
        }
        for (let key in reportMap) {
          combinedData.push(reportMap[key]);
        }
        setData(combinedData);
      }
    );
  };

  const handleAcceptChange = (row) => {
    const updatedRow = { ...row, accept: !row.accept };
    const reportRef = ref(database, `Reports/${row.id}`);

    update(reportRef, { accept: updatedRow.accept }).then(() => fetchData());
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const handleDelete = () => {
    const reportRef = ref(database, `Reports/${selectedRow.id}`);
    const locationRef = ref(database, `Locations/${selectedRow.locID}`);
    const thiefRef = ref(database, `Thiefs/${selectedRow.thiefID}`);

    remove(reportRef).then(() => fetchData());
    remove(locationRef).then(() => fetchData());
    remove(thiefRef).then(() => fetchData());

    setSelectedRow(null);
  };

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

  const notAcceptedData = data.filter((item) => !item.accept);
  const acceptedData = data.filter((item) => item.accept);

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
                  <td>{row.shave ? "Yes" : "No"}</td>
                  <td>{row.glasses ? "Yes" : "No"}</td>
                  <td>{row.body_length}</td>
                  <td>{row.body_size}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailsClick(row.id);
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
                  <td>{row.shave ? "Yes" : "No"}</td>
                  <td>{row.glasses ? "Yes" : "No"}</td>
                  <td>{row.body_length}</td>
                  <td>{row.body_size}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailsClick(row.id);
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

export default DataTable;
