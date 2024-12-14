import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Chip,
  Divider,
  TextField,
  Link
} from "@mui/material";

//import LikeButton from "../LikeButton";


function UserPhotos({ userId, loggedInUserId, changeTopBarTitle }) {
  const [userPhotos, setUserPhotos] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // State for managing upload process
  const [uploadError, setUploadError] = useState(""); // State for managing error messages

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      axios.get(`http://localhost:3000/user/${userId}`),
      axios.get(`http://localhost:3000/photosOfUser/${userId}`),
    ])
      .then(([userResponse, userPhotosResponse]) => {
        const sortedPhotos = userPhotosResponse.data.sort((a, b) => {
          if (b.likes?.length !== a.likes?.length) {
            return (b.likes?.length || 0) - (a.likes?.length || 0);
          }
          return new Date(b.date_time) - new Date(a.date_time);
        });
        setUserPhotos(sortedPhotos);
        changeTopBarTitle(
          `Photos of ${userResponse.data.first_name} ${userResponse.data.last_name}`
        );
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId, changeTopBarTitle]);

  const handleLikeToggle = (photoId, liked) => {

    const url = liked
        ? `http://localhost:3000/photos/${photoId}/unlike`
        : `http://localhost:3000/photos/${photoId}/like`;

    axios
        .post(url)
        .then(() => {
          setUserPhotos((prevPhotos) => prevPhotos.map((photo) => (photo._id === photoId
                      ? {
                        ...photo,
                        likes: liked
                            ? photo.likes.filter((id) => id !== loggedInUserId)
                            : [...(photo.likes || []), loggedInUserId],
                      }
                      : photo)
              )
          );
        })
        .catch((error) => {
          console.error("Error updating like:", error);
        });
    
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      console.log("Please select a valid image file.");
      return;
    }
    setSelectedPhoto(file);
  };


  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Add this useEffect to fetch all users for sharing
  useEffect(() => {
    axios
      .get("http://localhost:3000/user/list")
      .then((response) => {
        setAllUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const resetUploadState = () => {
    setSelectedPhoto(null);
    setSharingEnabled(false);
    setSelectedUsers([]);
  };

  const handleUpload = () => {
    if (!selectedPhoto) return;

    const formData = new FormData();
    formData.append("uploadedphoto", selectedPhoto);

    if (sharingEnabled) {
      formData.append("sharing_list", JSON.stringify(selectedUsers));
    }

    setUploading(true);
    setUploadError("");

    axios
      .post("http://localhost:3000/photos/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setOpen(false);
        resetUploadState();
        return axios.get(`http://localhost:3000/photosOfUser/${userId}`);
      })
      .then((res) => {
        setUserPhotos(res.data);
      })
      .catch((error) => {
        setUploadError(`${error} - Failed to upload photo. Please try again.`);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleCommentChange = (photoId, comment) => {
    setNewComments((prev) => ({ ...prev, [photoId]: comment }));
  };

  const handleCommentSubmit = (photoId) => {
    const comment = newComments[photoId]?.trim();
    if (!comment) {
      console.log("Comment cannot be empty.");
      return;
    }

    axios
      .post(`http://localhost:3000/commentsOfPhoto/${photoId}`, { comment })
      .then((response) => {
        const newComment = response.data;
        setUserPhotos((prevPhotos) => prevPhotos.map((photo) => (photo._id === photoId
              ? { ...photo, comments: [...photo.comments, newComment] }
              : photo)
          )
        );
        setNewComments((prev) => ({ ...prev, [photoId]: "" }));
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
        console.log("Failed to add comment. Please try again.");
      });
  };

  const handleDeletePhoto = (photoId) => {
    axios
        .delete(`http://localhost:3000/photos/${photoId}`)
        .then(() => {
          setUserPhotos((prevPhotos) => prevPhotos.filter((photo) => photo._id !== photoId));
        })
        .catch((error) => {
          console.error("Error deleting photo:", error);
        });
  };

  const handleDeleteComment = (photoId, commentIndex) => {
    axios
        .delete(`http://localhost:3000/photos/${photoId}/comments/${commentIndex}`)
        .then(() => {
          setUserPhotos((prevPhotos) => prevPhotos.map((photo) => (photo._id === photoId
                      ? {
                        ...photo,
                        comments: photo.comments.filter((_, index) => index !== commentIndex),
                      }
                      : photo)
              )
          );
          alert("Comment deleted successfully");
        })
        .catch((err) => {
          console.error("Failed to delete comment:", err);
          alert("Failed to delete the comment. Please try again.");
        });
  };

  return (
    <Box sx={{ padding: 2, height: "calc(100vh - 64px)", overflow: "auto" }}>
      <Stack spacing={4}>
        {isLoading && <Typography>Loading...</Typography>}
        {(loggedInUserId === userId) && (
          <Button variant="contained" onClick={() => setOpen(true)}>
                    Add Photo
          </Button>
        )}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <FormControlLabel
                control={(
                  <Switch
                    checked={sharingEnabled}
                    onChange={(e) => setSharingEnabled(e.target.checked)}
                  />
                )}
                label="Enable Sharing"
              />

              {sharingEnabled && (
                <FormControl fullWidth>
                  <InputLabel>Share with users</InputLabel>
                  <Select
                    multiple
                    value={selectedUsers}
                    onChange={(e) => setSelectedUsers(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((selectedUserId) => {
                            const user = allUsers.find((u) => u._id === selectedUserId);
                            return (
                                <Chip
                                key={selectedUserId}
                                label={`${user.first_name} ${user.last_name}`}
                                />
                            );
                            })}
                      </Box>
                    )}
                  >
                    {allUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {`${user.first_name} ${user.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Leave empty to make photo private
                  </FormHelperText>
                </FormControl>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedPhoto}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogActions>
          {uploadError && (
            <Typography color="error" sx={{ padding: 2 }}>
              {uploadError}
            </Typography>
          )}
        </Dialog>

        {userPhotos.map((photo) => {
          
          const likesArray = Array.isArray(photo.likes) ? photo.likes : [];
          const userLiked = likesArray.includes(loggedInUserId);
          const isPhotoOwner = photo.user_id === loggedInUserId;  // Check if logged-in user owns the photo
          
          return (
              <Card key={photo._id} sx={{ maxWidth: 600 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Posted {new Date(photo.date_time).toLocaleString()}
                    </Typography>

                    <Button
                        variant={userLiked ? "contained" : "outlined"}
                        onClick={() => handleLikeToggle(photo._id, userLiked)}
                    >
                      {userLiked ? "Unlike" : "Like"}
                    </Button>

                    {/* Only show delete photo button if user owns the photo */}
                    {isPhotoOwner && (
                      <Button onClick={() => handleDeletePhoto(photo._id)}>
                        Delete Photo
                      </Button>
                    )}

                    {photo.is_sharing_enabled && (
                        <Typography variant="body2" color="primary">
                          {photo.sharing_list?.length === 0
                              ? "Private"
                              : `Shared with ${photo.sharing_list?.length} users`}

                        </Typography>
                    )}
                  </Box>
                  <Typography variant="body2">{likesArray.length} likes</Typography>
                  <CardMedia
                      component="img"
                      image={`http://localhost:3000/images/${photo.file_name}`}
                      alt="User photo"
                      sx={{ height: 400, objectFit: "contain" }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    Posted {new Date(photo.date_time).toLocaleString()}
                  </Typography>
                  {photo.comments?.length > 0 && (
                      <Box>
                        <Typography variant="h6">Comments</Typography>
                        <Stack spacing={1}>
                          {photo.comments?.map((comment, index) => (
                              <Box key={index}>
                                <Divider />
                                <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: 1,
                                    }}
                                >
                                  {comment.user ? (
                                      <Link
                                          href={`#/users/${comment.user._id}`}
                                          underline="hover"
                                      >
                                        {`${comment.user.first_name} ${comment.user.last_name}`}
                                      </Link>
                                  ) : (
                                      <Typography variant="body2" color="error">
                                        Unknown User
                                      </Typography>
                                  )}
                                  <Typography variant="body2">
                                    {new Date(comment.date_time).toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography>{comment.comment}</Typography>

                                {(isPhotoOwner || (comment.user._id === loggedInUserId)) && (
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteComment(photo._id, index)}
                                >
                                  Delete Comment
                                </Button>
                                )}

                              </Box>
                          ))}
                        </Stack>
                      </Box>
                  )}
                  <Box sx={{ marginTop: 2 }}>
                    <TextField
                        label="Add a comment"
                        value={newComments[photo._id] || ""}
                        onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ marginBottom: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleCommentSubmit(photo._id)}
                    >
                      Post Comment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

export default UserPhotos;
