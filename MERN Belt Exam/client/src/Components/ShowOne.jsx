import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const ShowOne = () => {
  const { id } = useParams();
  const [oneThing, setOneThing] = useState({});
  const nav = useNavigate();
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/things/${id}`)
      .then((res) => {
        setOneThing(res.data);
        console.log(oneThing);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const deleteThing = () => {
    axios
      .delete(`http://localhost:8000/api/things/delete/${oneThing._id}`)
      .then((res) => nav(-1))
      .catch((err) => {
        console.log(err);
      });
  };
  const resetLikes = () => {
    setOneThing((oneThing.likes = 0));
    axios
      .patch(`http://localhost:8000/api/things/edit/${oneThing._id}`, oneThing)
      .then((res) => nav(-1))
      .catch((err) => console.log(err));
  };
  const likeThing = () => {
    setOneThing((oneThing.likes = oneThing.likes + 1));
    axios
      .patch(`http://localhost:8000/api/things/edit/${id}`, oneThing)
      .then((res) => nav(-1))
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "1%",
        }}
      >
        <h1>Like Dashboard</h1> <Link to="/">go back home</Link>
      </div>
      <div style={{ margin: "5%" }}>
        <h3>{oneThing.name} </h3>
        <h3>Likes: {oneThing.likes} </h3>
      </div>
      <div style={{ margin: "1%" }}>
        <button onClick={() => likeThing()}>Like</button>
      </div>
      <div style={{ margin: "1%" }}>
        <button onClick={() => deleteThing()}>Delete this thing</button>
      </div>
      <div style={{ margin: "1%" }}>
        <button onClick={() => resetLikes()}>Reset Likes</button>
      </div>
      <Link to={`/thing/edit/${oneThing._id}`}>
        <button>Change Name</button>
      </Link>
    </div>
  );
};

export default ShowOne;
