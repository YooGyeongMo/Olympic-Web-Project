import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue, push, remove, update } from "firebase/database";
import "./DataTable.css";

const DataTable = () => {
  const [reports, setReports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [thiefs, setThiefs] = useState([]);

  const [newReport, setNewReport] = useState({ reportID: "", timestamp: "" });
  const [newLocation, setNewLocation] = useState({
    reportID: "",
    latitude: "",
    longitude: "",
  });
  const [newThief, setNewThief] = useState({
    reportID: "",
    stolen_things: "",
    gender: "",
    race: "",
    shave: "",
    glasses: false,
    body_length: "",
    body_size: "",
  });

  const [editReport, setEditReport] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const [editThief, setEditThief] = useState(null);

  const [selectedReportID, setSelectedReportID] = useState(null);

  useEffect(() => {
    const reportsRef = ref(database, "Reports");
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const reportList = [];
      for (let id in data) {
        reportList.push({ id, ...data[id] });
      }
      setReports(reportList);
    });

    const locationsRef = ref(database, "Locations");
    onValue(locationsRef, (snapshot) => {
      const data = snapshot.val();
      const locationList = [];
      for (let id in data) {
        locationList.push({ id, ...data[id] });
      }
      setLocations(locationList);
    });

    const thiefsRef = ref(database, "Thiefs");
    onValue(thiefsRef, (snapshot) => {
      const data = snapshot.val();
      const thiefList = [];
      for (let id in data) {
        thiefList.push({ id, ...data[id] });
      }
      setThiefs(thiefList);
    });
  }, []);

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setNewLocation({ ...newLocation, [name]: value });
  };

  const handleThiefChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewThief({ ...newThief, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddReport = () => {
    const reportsRef = ref(database, "Reports");
    push(reportsRef, newReport);
    setNewReport({ reportID: "", timestamp: "" });
  };

  const handleAddLocation = () => {
    const locationsRef = ref(database, "Locations");
    push(locationsRef, newLocation);
    setNewLocation({ reportID: "", latitude: "", longitude: "" });
  };

  const handleAddThief = () => {
    const thiefsRef = ref(database, "Thiefs");
    push(thiefsRef, newThief);
    setNewThief({
      reportID: "",
      stolen_things: "",
      gender: "",
      race: "",
      shave: "",
      glasses: false,
      body_length: "",
      body_size: "",
    });
  };

  const handleDeleteReport = (id) => {
    const reportRef = ref(database, `Reports/${id}`);
    remove(reportRef);
  };

  const handleDeleteLocation = (id) => {
    const locationRef = ref(database, `Locations/${id}`);
    remove(locationRef);
  };

  const handleDeleteThief = (id) => {
    const thiefRef = ref(database, `Thiefs/${id}`);
    remove(thiefRef);
  };

  const handleEditReport = (report) => {
    setEditReport(report);
  };

  const handleEditLocation = (location) => {
    setEditLocation(location);
  };

  const handleEditThief = (thief) => {
    setEditThief(thief);
  };

  const handleUpdateReport = () => {
    const reportRef = ref(database, `Reports/${editReport.id}`);
    update(reportRef, {
      reportID: editReport.reportID,
      timestamp: editReport.timestamp,
    });
    setEditReport(null);
  };

  const handleUpdateLocation = () => {
    const locationRef = ref(database, `Locations/${editLocation.id}`);
    update(locationRef, {
      reportID: editLocation.reportID,
      latitude: editLocation.latitude,
      longitude: editLocation.longitude,
    });
    setEditLocation(null);
  };

  const handleUpdateThief = () => {
    const thiefRef = ref(database, `Thiefs/${editThief.id}`);
    update(thiefRef, {
      reportID: editThief.reportID,
      stolen_things: editThief.stolen_things,
      gender: editThief.gender,
      race: editThief.race,
      shave: editThief.shave,
      glasses: editThief.glasses,
      body_length: editThief.body_length,
      body_size: editThief.body_size,
    });
    setEditThief(null);
  };

  const handleRowClick = (reportID) => {
    setSelectedReportID(reportID);
  };

  return (
    <div className="table-container">
      <h2>Reports</h2>
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              onClick={() => handleRowClick(report.reportID)}
              style={{
                backgroundColor:
                  selectedReportID === report.reportID ? "lightblue" : "white",
              }}
            >
              <td>{report.reportID}</td>
              <td>
                {editReport && editReport.id === report.id ? (
                  <input
                    type="text"
                    name="timestamp"
                    value={editReport.timestamp}
                    onChange={(e) =>
                      setEditReport({
                        ...editReport,
                        timestamp: e.target.value,
                      })
                    }
                  />
                ) : (
                  report.timestamp
                )}
              </td>
              <td>
                {editReport && editReport.id === report.id ? (
                  <button className="update" onClick={handleUpdateReport}>
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      className="edit"
                      onClick={() => handleEditReport(report)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Locations</h2>
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr
              key={location.id}
              onClick={() => handleRowClick(location.reportID)}
              style={{
                backgroundColor:
                  selectedReportID === location.reportID
                    ? "lightblue"
                    : "white",
              }}
            >
              <td>
                {editLocation && editLocation.id === location.id ? (
                  <input
                    type="text"
                    name="reportID"
                    value={editLocation.reportID}
                    onChange={(e) =>
                      setEditLocation({
                        ...editLocation,
                        reportID: e.target.value,
                      })
                    }
                  />
                ) : (
                  location.reportID
                )}
              </td>
              <td>
                {editLocation && editLocation.id === location.id ? (
                  <input
                    type="number"
                    name="latitude"
                    value={editLocation.latitude}
                    onChange={(e) =>
                      setEditLocation({
                        ...editLocation,
                        latitude: e.target.value,
                      })
                    }
                  />
                ) : (
                  location.latitude
                )}
              </td>
              <td>
                {editLocation && editLocation.id === location.id ? (
                  <input
                    type="number"
                    name="longitude"
                    value={editLocation.longitude}
                    onChange={(e) =>
                      setEditLocation({
                        ...editLocation,
                        longitude: e.target.value,
                      })
                    }
                  />
                ) : (
                  location.longitude
                )}
              </td>
              <td>
                {editLocation && editLocation.id === location.id ? (
                  <button className="update" onClick={handleUpdateLocation}>
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      className="edit"
                      onClick={() => handleEditLocation(location)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Thiefs</h2>
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Stolen Things</th>
            <th>Gender</th>
            <th>Race</th>
            <th>Shave</th>
            <th>Glasses</th>
            <th>Body Length</th>
            <th>Body Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {thiefs.map((thief) => (
            <tr
              key={thief.id}
              onClick={() => handleRowClick(thief.reportID)}
              style={{
                backgroundColor:
                  selectedReportID === thief.reportID ? "lightblue" : "white",
              }}
            >
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="reportID"
                    value={editThief.reportID}
                    onChange={(e) =>
                      setEditThief({ ...editThief, reportID: e.target.value })
                    }
                  />
                ) : (
                  thief.reportID
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="stolen_things"
                    value={editThief.stolen_things}
                    onChange={(e) =>
                      setEditThief({
                        ...editThief,
                        stolen_things: e.target.value,
                      })
                    }
                  />
                ) : (
                  thief.stolen_things
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="gender"
                    value={editThief.gender}
                    onChange={(e) =>
                      setEditThief({ ...editThief, gender: e.target.value })
                    }
                  />
                ) : (
                  thief.gender
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="race"
                    value={editThief.race}
                    onChange={(e) =>
                      setEditThief({ ...editThief, race: e.target.value })
                    }
                  />
                ) : (
                  thief.race
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="shave"
                    value={editThief.shave}
                    onChange={(e) =>
                      setEditThief({ ...editThief, shave: e.target.value })
                    }
                  />
                ) : (
                  thief.shave
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="checkbox"
                    name="glasses"
                    checked={editThief.glasses}
                    onChange={(e) =>
                      setEditThief({ ...editThief, glasses: e.target.checked })
                    }
                  />
                ) : thief.glasses ? (
                  "Yes"
                ) : (
                  "No"
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="number"
                    name="body_length"
                    value={editThief.body_length}
                    onChange={(e) =>
                      setEditThief({
                        ...editThief,
                        body_length: e.target.value,
                      })
                    }
                  />
                ) : (
                  thief.body_length
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <input
                    type="text"
                    name="body_size"
                    value={editThief.body_size}
                    onChange={(e) =>
                      setEditThief({ ...editThief, body_size: e.target.value })
                    }
                  />
                ) : (
                  thief.body_size
                )}
              </td>
              <td>
                {editThief && editThief.id === thief.id ? (
                  <button className="update" onClick={handleUpdateThief}>
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      className="edit"
                      onClick={() => handleEditThief(thief)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteThief(thief.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add New Entries</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddReport();
        }}
      >
        <h3>Add New Report</h3>
        <input
          type="text"
          name="reportID"
          value={newReport.reportID}
          onChange={handleReportChange}
          placeholder="Report ID"
        />
        <input
          type="text"
          name="timestamp"
          value={newReport.timestamp}
          onChange={handleReportChange}
          placeholder="Timestamp"
        />
        <button className="add" type="submit">
          Add Report
        </button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddLocation();
        }}
      >
        <h3>Add New Location</h3>
        <input
          type="text"
          name="reportID"
          value={newLocation.reportID}
          onChange={handleLocationChange}
          placeholder="Report ID"
        />
        <input
          type="number"
          name="latitude"
          value={newLocation.latitude}
          onChange={handleLocationChange}
          placeholder="Latitude"
        />
        <input
          type="number"
          name="longitude"
          value={newLocation.longitude}
          onChange={handleLocationChange}
          placeholder="Longitude"
        />
        <button className="add" type="submit">
          Add Location
        </button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddThief();
        }}
      >
        <h3>Add New Thief</h3>
        <input
          type="text"
          name="reportID"
          value={newThief.reportID}
          onChange={handleThiefChange}
          placeholder="Report ID"
        />
        <input
          type="text"
          name="stolen_things"
          value={newThief.stolen_things}
          onChange={handleThiefChange}
          placeholder="Stolen Things"
        />
        <input
          type="text"
          name="gender"
          value={newThief.gender}
          onChange={handleThiefChange}
          placeholder="Gender"
        />
        <input
          type="text"
          name="race"
          value={newThief.race}
          onChange={handleThiefChange}
          placeholder="Race"
        />
        <input
          type="text"
          name="shave"
          value={newThief.shave}
          onChange={handleThiefChange}
          placeholder="Shave"
        />
        <label>
          <input
            type="checkbox"
            name="glasses"
            checked={newThief.glasses}
            onChange={(e) =>
              setNewThief({ ...newThief, glasses: e.target.checked })
            }
          />{" "}
          Glasses
        </label>
        <input
          type="number"
          name="body_length"
          value={newThief.body_length}
          onChange={handleThiefChange}
          placeholder="Body Length"
        />
        <input
          type="text"
          name="body_size"
          value={newThief.body_size}
          onChange={handleThiefChange}
          placeholder="Body Size"
        />
        <button className="add" type="submit">
          Add Thief
        </button>
      </form>
    </div>
  );
};

export default DataTable;
