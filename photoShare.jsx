/* eslint-disable react/jsx-no-bind */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams } from "react-router-dom";
import axios from "axios";
import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

function UserDetailRoute({ changeTopBarTitle }) {
  const { userId } = useParams();
  return <UserDetail userId={userId} changeTopBarTitle={changeTopBarTitle} />;
}

function UserPhotosRoute({ changeTopBarTitle }) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} changeTopBarTitle={changeTopBarTitle} />;
}

function PhotoShare() {
  const [user, setUser] = useState(null);
  const [topBarTitle, setTopBarTitle] = useState("");

  function changeTopBarTitle(title) {
    setTopBarTitle(title);
  }

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/admin/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    axios.get(`http://localhost:3000/test/info`)
      .then((response) => setTopBarTitle(`v ${response.data.__v}`))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar 
              title={topBarTitle} 
              user={user} 
              onLogout={handleLogout}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          {user ? (
            <>
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList />
                </Paper>
              </Grid>
              <Grid item sm={9}>
                <Paper className="main-grid-item">
                  <Routes>
                    <Route
                      path="/users/:userId"
                      element={
                        <UserDetailRoute changeTopBarTitle={changeTopBarTitle} />
                      }
                    />
                    <Route
                      path="/photos/:userId"
                      element={
                        <UserPhotosRoute changeTopBarTitle={changeTopBarTitle} />
                      }
                    />
                    <Route path="/users" element={<UserList />} />
                  </Routes>
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper className="main-grid-item">
                <LoginRegister onLogin={handleLogin} />
              </Paper>
            </Grid>
          )}
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
