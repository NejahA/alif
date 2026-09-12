import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Edit = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const [thing, setThing] = useState({});
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/things/${id}`)
      .then((res) => {
        setThing(res.data);
        console.log(thing);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .patch(`http://localhost:8000/api/things/edit/${id}`, thing)
      .then((res) => {
        console.log(res);
        nav(-1);
      })
      .catch((err) => {
        setThing({ ...thing, errors: err.response.data });
        console.log(err);
      });
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            margin: "1%",
          }}
        >
          <h1> Like Dashboard </h1>
          <Link to="/">go back home</Link>
        </div>
        <p>Change the name of this thing!</p>
        <input
          type="text"
          onChange={(e) => setThing({ ...thing, name: e.target.value })}
          value={thing.name}
        />
        {thing.errors &&
          thing.errors.errors &&
          thing.errors.errors.name &&
          thing.errors.errors.name.message === "required" && (
            <p style={{ color: "red" }}>Thing is required </p>
          )}
        {thing.errors &&
          thing.errors.errors &&
          thing.errors.errors.name &&
          thing.errors.errors.name.message === "minlength" && (
            <p style={{ color: "red" }}>Thing must contain 3 characters </p>
          )}
        {thing.errors &&
          thing.errors.errors &&
          thing.errors.errors.name &&
          thing.errors.errors.name.message === "censored" && (
            <p style={{ color: "red" }}> Thing can not contain "cake" </p>
          )}

        <div style={{ margin: "1%" }}>
          <button>Change Name</button>
        </div>
      </form>
    </div>
  );
};

export default Edit;
