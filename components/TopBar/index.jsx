import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import "./styles.css";
import axios from "axios";
import ActivityFeed from "../ActivityFeed";


function TopBar({ title, user, onLogout, onAddPhoto }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);

    const handleDeleteAccount = () => {
        setDeleting(true);
        axios
            .delete(`http://localhost:3000/users/${user._id}`)
            .then(() => {
                alert("Account deleted successfully!");
                setDeleting(false);
                setDeleteDialogOpen(false);
                window.location.reload(); // Refresh the page
            })
            .catch((error) => {
                console.error("Error deleting account:", error);
                setDeleting(false);
                alert("Failed to delete account. Please try again.");
            });
    };

    return (
        <div>
            <AppBar className="topbar-appBar" position="absolute">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h5" color="inherit">
                        {user ? `${user.first_name} ${user.last_name}` : "App Title"}
                    </Typography>
                    <Typography variant="h5" color="inherit">
                        {title}
                    </Typography>
                    {user ? (
                        <div>
                            <Typography
                                variant="subtitle1"
                                color="inherit"
                                sx={{ display: "inline-block", marginRight: 2 }}
                            >
                                Hi {user.first_name} {user.last_name}
                            </Typography>
                            
                            <Button
                                color="inherit"
                                onClick={onAddPhoto}
                                sx={{ marginRight: 2 }}
                            >
                                Add Photo
                            </Button>

                            <Button 
                                color="inherit" 
                                onClick={() => setActivityDialogOpen(true)}
                            >
                                Activities
                            </Button>

                            <Button color="inherit" onClick={onLogout}>
                                Logout
                            </Button>
                            
                            <Button
                                color="inherit"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    ) : (
                        <Typography variant="subtitle1" color="inherit">
                            Please Login
                        </Typography>
                    )}
                    
                    <ActivityFeed 
                        open={activityDialogOpen}
                        onClose={() => setActivityDialogOpen(false)}
                    />
                </Toolbar>
            </AppBar>
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="textSecondary">
                        Are you sure you want to permanently delete your account? This
                        action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete Account"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TopBar;