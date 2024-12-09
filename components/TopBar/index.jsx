import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import "./styles.css";

function TopBar({ title, user, onLogout, onAddPhoto }) {
    return (
        <AppBar className="topbar-appBar" position="absolute">
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Typography variant="h5" color="inherit">
                    {user ? `${user.first_name} ${user.last_name}` : 'App Title'}
                </Typography>
                <Typography variant="h5" color="inherit">
                    {title}
                </Typography>
                {user ? (
                    <div>
                        <Typography variant="subtitle1" color="inherit" sx={{ display: 'inline-block', marginRight: 2 }}>
                            Hi {user.first_name} {user.last_name}
                        </Typography>
                        <Button color="inherit" onClick={onAddPhoto} sx={{ marginRight: 2 }}>
                            Add Photo
                        </Button>
                        <Button color="inherit" onClick={onLogout}>
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Typography variant="subtitle1" color="inherit">
                        Please Login
                    </Typography>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
