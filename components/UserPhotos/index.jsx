import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Typography,
    Card,
    CardContent,
    CardMedia,
    Link,
    Box,
    Divider,
    Stack,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";

function UserPhotos({ userId, changeTopBarTitle }) {
    const [userPhotos, setUserPhotos] = useState([]);
    const [newComments, setNewComments] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);  // State for managing upload process
    const [uploadError, setUploadError] = useState("");  // State for managing error messages

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            axios.get(`http://localhost:3000/user/${userId}`),
            axios.get(`http://localhost:3000/photosOfUser/${userId}`),
        ])
            .then(([userResponse, userPhotosResponse]) => {
                setUserPhotos(userPhotosResponse.data);
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

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file && !file.type.startsWith("image/")) {
            console.log("Please select a valid image file.");
            return;
        }
        setSelectedPhoto(file);
    };

    const handleUpload = () => {
        if (!selectedPhoto) {
            console.log("Please select a photo.");
            return;
        }

        const formData = new FormData();
        formData.append("uploadedphoto", selectedPhoto);

        setUploading(true);
        setUploadError("");  // Reset the error state

        axios
            .post("http://localhost:3000/photos/new", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(() => {
                console.log("Photo uploaded successfully!");
                setOpen(false);
                setSelectedPhoto(null);
                return axios.get(`http://localhost:3000/photosOfUser/${userId}`);
            })
            .then((res) => {
                setUserPhotos(res.data);
            })
            .catch((error) => {
                console.error("Error uploading photo:", error);
                setUploadError("Failed to upload photo. Please try again.");
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

    return (
        <Box sx={{ padding: 2, height: "calc(100vh - 64px)", overflow: "auto" }}>
            <Stack spacing={4}>
                {isLoading && <Typography>Loading...</Typography>}
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Add Photo
                </Button>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Upload Photo</DialogTitle>
                    <DialogContent>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}  // Disable button during upload
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

                {userPhotos.map((photo) => (
                    <Card key={photo._id} sx={{ maxWidth: 600 }}>
                        <CardMedia
                            component="img"
                            image={`http://localhost:3000/images/${photo.file_name}`}
                            alt="User photo"
                            sx={{ height: 400, objectFit: "contain" }}
                        />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Posted {new Date(photo.date_time).toLocaleString()}
                            </Typography>
                            {photo.comments?.length > 0 && (
                                <Box>
                                    <Typography variant="h6">Comments</Typography>
                                    <Stack spacing={1}>
                                        {photo.comments?.map((comment) => (
                                            <Box key={comment._id}>
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
                ))}
            </Stack>
        </Box>
    );
}

export default UserPhotos;
