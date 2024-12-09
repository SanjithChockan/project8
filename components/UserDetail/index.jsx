import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import "./styles.css";
//import fetchModel from "../../lib/fetchModelData";

function UserDetail({ userId, changeTopBarTitle }) {
  const navigate = useNavigate();

  // TODO: Shift empty user schema
  // to constants
  const [user, setUser] = useState({
    _id: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  /*useEffect(() => {
    fetchModel(`http://localhost:3000/user/${userId}`).then((response) => {
      setUser(response.data);
      changeTopBarTitle(
        `${response.data.first_name} ${response.data.last_name}`
      );
    });
  }, [userId]);*/

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        changeTopBarTitle(
          `${response.data.first_name} ${response.data.last_name}`
        );
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        // Handle the error appropriately, e.g., set an error state or show a message to the user
      });
  }, [userId]);

  const handleUserClick = () => {
    navigate(`/photos/${userId}`);
  };

  const card = (
    <React.Fragment>
      <CardContent>
        <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
          User Details
        </Typography>
        <Typography variant="h5" component="div">
          {`${user.first_name} ${user.last_name}`}
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
          {`${user.occupation} - ${user.location}`}
        </Typography>
        <Typography variant="body2">{user.description}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => handleUserClick()}>
          View Photos
        </Button>
      </CardActions>
    </React.Fragment>
  );

  return (
    <div>
      <Box sx={{ minWidth: 275 }}>
        <Card variant="outlined">{card}</Card>
      </Box>
    </div>
  );
}

export default UserDetail;
