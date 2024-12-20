// components/ActivityFeed.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button
} from '@mui/material';
import axios from 'axios';

function ActivityFeed({ open, onClose }) {
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/activities');
      setActivities(response.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchActivities();
    }
  }, [open]);

  const renderActivityContent = (activity) => {
    if (['PHOTO_UPLOAD', 'NEW_COMMENT', 'USER_LIKE', 'USER_UNLIKE', 'DELETE_COMMENT'].includes(activity.activity_type) && activity.photo_id) {
      let fileName = '';
      if (`${activity.photo_id?.file_name}` === 'undefined') {
        fileName = 'black.jpeg';
      }
      else {
        fileName = activity.photo_id?.file_name;
      }
      //console.log(`fileName: ${fileName}`);
      return (
        <ListItemAvatar>
          <Avatar 
            src={`/images/${fileName}`}
            variant="square"
            sx={{ width: 50, height: 50 }}
          />
        </ListItemAvatar>
      );
    }
    return null;
  };

  const getActivityText = (activity) => {
    let userName = `${activity.user_id?.first_name} ${activity.user_id?.last_name}`;
    if (userName === 'undefined undefined') {
      userName = 'An user';
    }
    switch (activity.activity_type) {
      case 'PHOTO_UPLOAD':
        return `${userName} uploaded a new photo`;
      case 'NEW_COMMENT':
        return `${userName} commented on a photo`;
      case 'USER_REGISTER':
        return `${userName} registered`;
      case 'USER_LOGIN':
        return `${userName} logged in`;
      case 'USER_LOGOUT':
        return `${userName} logged out`;
      case 'USER_LIKE':
        return `${userName} liked a photo`;
      case 'USER_UNLIKE':
        return `${userName} unliked a photo`;
      case 'DELETE_USER':
        return `${userName} deleted their account`;
      case 'DELETE_COMMENT':
        return `${userName} deleted a comment`;
      case 'DELETE_PHOTO':
        return `${userName} deleted a photo`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Recent Activities
        <Button 
          onClick={fetchActivities}
          sx={{ float: 'right' }}
          variant="contained"
          size="small"
        >
          Refresh
        </Button>
      </DialogTitle>
      <DialogContent>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity._id}>
              {renderActivityContent(activity)}
              <ListItemText
                primary={getActivityText(activity)}
                secondary={new Date(activity.date_time).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityFeed;