import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, push, remove, update } from "firebase/database";
import "./DataTable.css";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    reportID: "",
    timestamp: "",
    latitude: "",
    longitude: "",
    stolen_things: "",
    gender: "",
    race: "",
    shave: false,
    glasses: false,
    body_length: "",
    body_size: "",
  });
  const [editData, setEditData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewData({ ...newData, [name]: type === "checkbox" ? checked : value });
  };

  const handleAdd = () => {
    if (!newData.reportID || !newData.timestamp) {
      setModalMessage("Report ID and Timestamp are required.");
      setShowModal(true);
      return;
    }

    const existingReport = data.find(
      (item) => item.reportID === newData.reportID
    );
    if (existingReport) {
      setModalMessage(
        "Report ID already exists. Please enter a unique Report ID."
      );
      setShowModal(true);
      return;
    }

    const newReport = {
      reportID: newData.reportID,
      timestamp: newData.timestamp,
    };
    const newLocation = {
      reportID: newData.reportID,
      latitude: newData.latitude,
      longitude: newData.longitude,
    };
    const newThief = {
      reportID: newData.reportID,
      stolen_things: newData.stolen_things,
      gender: newData.gender,
      race: newData.race,
      shave: newData.shave,
      glasses: newData.glasses,
      body_length: newData.body_length,
      body_size: newData.body_size,
    };

    push(ref(database, "Reports"), newReport).then(() => fetchData());
    push(ref(database, "Locations"), newLocation).then(() => fetchData());
    push(ref(database, "Thiefs"), newThief).then(() => fetchData());

    setNewData({
      reportID: "",
      timestamp: "",
      latitude: "",
      longitude: "",
      stolen_things: "",
      gender: "",
      race: "",
      shave: false,
      glasses: false,
      body_length: "",
      body_size: "",
    });
  };

  const handleEdit = () => {
    setEditData(selectedRow);
  };

  const handleSave = () => {
    const reportRef = ref(database, `Reports/${editData.id}`);
    const locationRef = ref(database, `Locations/${editData.locID}`);
    const thiefRef = ref(database, `Thiefs/${editData.thiefID}`);

    update(reportRef, {
      reportID: editData.reportID,
      timestamp: editData.timestamp,
    });

    update(locationRef, {
      reportID: editData.reportID,
      latitude: editData.latitude,
      longitude: editData.longitude,
    });

    update(thiefRef, {
      reportID: editData.reportID,
      stolen_things: editData.stolen_things,
      gender: editData.gender,
      race: editData.race,
      shave: editData.shave,
      glasses: editData.glasses,
      body_length: editData.body_length,
      body_size: editData.body_size,
    });

    setEditData(null);
    setSelectedRow(null);
    fetchData();
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

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="table-container">
      <h2>Data Table</h2>
      <table>
        <thead>
          <tr>
            <th>
              Report ID<span className="required">*</span>
            </th>
            <th>
              Timestamp<span className="required">*</span>
            </th>
            <th>위도</th>
            <th>경도</th>
            <th>도난당한 물품</th>
            <th>성별</th>
            <th>인종</th>
            <th>수염 유무</th>
            <th>안경 유무</th>
            <th>키</th>
            <th>덩치</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
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
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="reportID"
                    value={editData.reportID}
                    onChange={(e) =>
                      setEditData({ ...editData, reportID: e.target.value })
                    }
                  />
                ) : (
                  row.reportID
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="timestamp"
                    value={editData.timestamp}
                    onChange={(e) =>
                      setEditData({ ...editData, timestamp: e.target.value })
                    }
                  />
                ) : (
                  row.timestamp
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="latitude"
                    value={editData.latitude}
                    onChange={(e) =>
                      setEditData({ ...editData, latitude: e.target.value })
                    }
                  />
                ) : (
                  row.latitude
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="longitude"
                    value={editData.longitude}
                    onChange={(e) =>
                      setEditData({ ...editData, longitude: e.target.value })
                    }
                  />
                ) : (
                  row.longitude
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="stolen_things"
                    value={editData.stolen_things}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        stolen_things: e.target.value,
                      })
                    }
                  />
                ) : (
                  row.stolen_things
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={editData.gender === "Male"}
                      onChange={(e) =>
                        setEditData({ ...editData, gender: e.target.value })
                      }
                    />{" "}
                    Male
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={editData.gender === "Female"}
                      onChange={(e) =>
                        setEditData({ ...editData, gender: e.target.value })
                      }
                    />{" "}
                    Female
                  </>
                ) : (
                  row.gender
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="race"
                    value={editData.race}
                    onChange={(e) =>
                      setEditData({ ...editData, race: e.target.value })
                    }
                  />
                ) : (
                  row.race
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="checkbox"
                    name="shave"
                    checked={editData.shave}
                    onChange={(e) =>
                      setEditData({ ...editData, shave: e.target.checked })
                    }
                  />
                ) : row.shave ? (
                  "Yes"
                ) : (
                  "No"
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="checkbox"
                    name="glasses"
                    checked={editData.glasses}
                    onChange={(e) =>
                      setEditData({ ...editData, glasses: e.target.checked })
                    }
                  />
                ) : row.glasses ? (
                  "Yes"
                ) : (
                  "No"
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="body_length"
                    value={editData.body_length}
                    onChange={(e) =>
                      setEditData({ ...editData, body_length: e.target.value })
                    }
                  />
                ) : (
                  row.body_length
                )}
              </td>
              <td>
                {editData && editData.reportID === row.reportID ? (
                  <input
                    type="text"
                    name="body_size"
                    value={editData.body_size}
                    onChange={(e) =>
                      setEditData({ ...editData, body_size: e.target.value })
                    }
                  />
                ) : (
                  row.body_size
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions">
        <button onClick={handleAdd} className="add">
          Add New Entry
        </button>
        {selectedRow && (
          <>
            {editData ? (
              <button onClick={handleSave} className="save">
                Save
              </button>
            ) : (
              <button onClick={handleEdit} className="edit">
                Edit
              </button>
            )}
            <button onClick={handleDelete} className="delete">
              Delete
            </button>
          </>
        )}
      </div>

      <div className="form-container">
        <h2>Add New Entry</h2>
        <form>
          <div className="form-row">
            <div className="form-row-left">
              <label>
                Report ID<span className="required">*</span>:
              </label>
              <input
                type="text"
                name="reportID"
                value={newData.reportID}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-left">
              <label>
                Timestamp<span className="required">*</span>:
              </label>
              <input
                type="text"
                name="timestamp"
                value={newData.timestamp}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-row-right">
              <label>Latitude:</label>
              <input
                type="text"
                name="latitude"
                value={newData.latitude}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-right">
              <label>Longitude:</label>
              <input
                type="text"
                name="longitude"
                value={newData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-row-right">
              <label>Stolen Things:</label>
              <input
                type="text"
                name="stolen_things"
                value={newData.stolen_things}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-right">
              <label>Gender:</label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={newData.gender === "Male"}
                onChange={handleChange}
              />{" "}
              Male
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={newData.gender === "Female"}
                onChange={handleChange}
              />{" "}
              Female
            </div>
          </div>
          <div className="form-row">
            <div className="form-row-right">
              <label>Race:</label>
              <input
                type="text"
                name="race"
                value={newData.race}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-right">
              <label>Shave:</label>
              <input
                type="checkbox"
                name="shave"
                checked={newData.shave}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-row-right">
              <label>Glasses:</label>
              <input
                type="checkbox"
                name="glasses"
                checked={newData.glasses}
                onChange={handleChange}
              />
            </div>
            <div className="form-row-right">
              <label>Body Length:</label>
              <input
                type="text"
                name="body_length"
                value={newData.body_length}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-row-right">
              <label>Body Size:</label>
              <input
                type="text"
                name="body_size"
                value={newData.body_size}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
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
