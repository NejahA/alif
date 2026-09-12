import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const [allThnigs, setAllThings] = useState([]);
  const [liked, setLiked] = useState({});
  const nav = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/things/")
      .then((res) => {
        setAllThings(res.data);
        console.log(allThnigs);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const [thing, setThing] = useState({ errors: null });

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8000/api/things/new", thing)
      .then((res) => axios.get("http://localhost:8000/api/things/"))
      .then((res) => {
        setAllThings(res.data);
        console.log(allThnigs);
      })
      .catch((err) => {
        setThing({ ...thing, errors: err.response.data });
        console.log(err);
      });
    setThing({});
  };

  return (
    <div>
      <h1>Like Dashboard</h1>
      <h4>Like these things!</h4>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Thing</th>
            <th>Likes</th>
            <th>Action</th>
          </tr>
        </thead>
        {allThnigs &&
          allThnigs
            .sort((a, b) => {
              return b.likes - a.likes;
            })
            .map((el) => (
              <tr>
                <th>{el.name}</th>
                <th>{el.likes} </th>
                <th>
                  <Link to={`/thing/${el._id}`}>
                    <button>Edit</button>
                  </Link>
                </th>
              </tr>
            ))}
      </table>
      <form onSubmit={handleSubmit}>
        <p> Don't see what you like? Add your own! </p>
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

        <button>I like this!</button>
      </form>
    </div>
  );
};

export default Home;
