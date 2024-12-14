/*
import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@mui/material";

function LikeButton({passedPhotoId, userLiked, setUserPhotos}) {
  
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
                                ? photo.likes.filter((id) => id !== userId)
                                : [...(photo.likes || []), userId],
                          }
                          : photo)
                  )
              );
            })
            .catch((error) => {
              console.error("Error updating like:", error);
            });
        
      };

  return (
    <Button
                        variant={userLiked ? "contained" : "outlined"}
                        onClick={() => handleLikeToggle(passedPhotoId, userLiked)}
                    >
                      {userLiked ? "Unlike" : "Like"}
    </Button>
  );
}

export default LikeButton;
*/