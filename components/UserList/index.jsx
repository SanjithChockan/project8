import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import "./styles.css";
//import fetchModel from "../../lib/fetchModelData";

function UserList() {
  const navigate = useNavigate();
  // const users = window.models.userListModel();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    //fetchModel(`http://localhost:3000/user/list`).then((response) => setUsers(response.data)
    axios.get(`http://localhost:3000/user/list`)
    .then((response) => setUsers(response.data))
    .catch((error) => {
      console.error('Error fetching user list:', error);
      // Handle the error appropriately, e.g., set an error state or show a message to the user
    });
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleUserClick(user._id)}>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                />
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
