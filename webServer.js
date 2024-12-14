/* eslint-disable consistent-return */
/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();
const path = require("path");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


// Load the Mongoose schema for User, Photo, and SchemaInfo
const fs = require("fs");
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require('./schema/activity.js');


// add the express-session and body-parser middleware to express with the Express use
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        // No SchemaInfo found - return 500 error
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
    // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.


    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    try {
      await Promise.all(
          collections.map(async (col) => {
            col.count = await col.collection.countDocuments({});
            return col;
          })
      );

      const obj = {};
      for (let i = 0; i < collections.length; i++) {
        obj[collections[i].name] = collections[i].count;
      }
      return response.end(JSON.stringify(obj));
    } catch (err) {
      return response.status(500).send(JSON.stringify(err));
    }
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});


// eslint-disable-next-line consistent-return
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", requireLogin, async function (request, response) {
  //response.status(200).send(models.userListModel());

  try{
    const users = await User.find({}, '_id first_name last_name');
    //console.log(`sending user list: ${JSON.stringify(users)}`);
    //console.log(`models.userListModel(): ${JSON.stringify(models.userListModel())}`);
    return response.json(users);
  } catch(err){
    // Handle any errors that occurred during the query
    console.error("Error fetching user list:", err);
    return response.status(500).json(err); // Send the error as JSON
  }

});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", requireLogin, async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send("Invalid user ID format");
  }

  try {
    const user = await User.findById(id, '_id first_name last_name location description occupation');
    if (!user) return response.status(404).send("User not found");
    return response.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return response.status(500).send("Internal server error");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", requireLogin, async function (request, response) {
  const viewer_id = request.session.user_id;
  const owner_id = request.params.id;

  try {
    // Build the query to check permissions
    const query = {
      user_id: owner_id,
      $or: [
        { is_sharing_enabled: false }, // Public photos
        { user_id: viewer_id }, // User's own photos
        { sharing_list: viewer_id }, // Shared with viewer
        { 
          is_sharing_enabled: true, 
          sharing_list: { $size: 0 }, 
          user_id: viewer_id 
        } // Private photos visible only to owner
      ]
    };

    const photos = await Photo.find(query);
    
    // Populate comments with user info
    const populatedPhotos = await Promise.all(photos.map(async photo => {
      const newComments = await Promise.all(photo.comments.map(async comment => {
        const user = await User.findById(comment.user_id, '_id first_name last_name');
        return {
          comment: comment.comment,
          date_time: comment.date_time,
          _id: comment._id,
          user
        };
      }));

      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: newComments,
        likes: Array.isArray(photo.likes) ? photo.likes : [],
        liked_by_user: photo.likes.includes(viewer_id),
        sharing_list: photo.sharing_list,
        is_sharing_enabled: photo.is_sharing_enabled
      };
    }));

    return response.json(populatedPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    return response.status(500).json({ error: "Internal server error" });
  }
});


app.post('/user', async function (req, res) {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ error: 'Login name already exists' });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    await newUser.save();

    await Activity.create({
      user_id: newUser._id,
      activity_type: 'USER_REGISTER'
    });

    return res.json({ login_name: newUser.login_name });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * URL /admin/login - Provides a way for the photo app's LoginRegister view to login in a user.
 */

app.post('/admin/login', async function (req, res) {
  const { login_name, password } = req.body;
  try {
    const user = await User.findOne({ login_name });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid login name or password' });
    }
    req.session.user_id = user._id;

    await Activity.create({
      user_id: user._id,
      activity_type: 'USER_LOGIN'
    });

    return res.json({ _id: user._id, first_name: user.first_name });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * URL /admin/logout - A POST request with an empty body to this URL
 * will logout the user by clearing the information stored in the session.
 */


app.post('/admin/logout', async function (req, res) {
  if (!req.session.user_id) {
    return res.status(400).json({ error: 'Not logged in' });
  }
  req.session.destroy( err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    /*
    (async () => {
      await Activity.create({
        user_id: req.session.user_id,
        activity_type: 'USER_LOGOUT'
      });
    })();
    */
    return res.json({ success: true });

  });
  return null;
});

app.post('/commentsOfPhoto/:photo_id', requireLogin, async function (req, res) {
  const { photo_id } = req.params;
  const { comment } = req.body;
  const user_id = req.session.user_id;

  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const newComment = {
      comment: comment.trim(),
      user_id: user_id,
      date_time: new Date(),
    };

    photo.comments.push(newComment);

    await photo.save();
    // Fetch user details for the new comment
    const user = await User.findById(user_id, '_id first_name last_name');
    newComment.user = user;

    await Activity.create({
      user_id: req.session.user_id,
      activity_type: 'NEW_COMMENT',
      photo_id: photo._id
    });

    return res.status(200).json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/photos/new', requireLogin, processFormBody, async (req, res) => {
  console.log('Photo upload request received');

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!req.session || !req.session.user_id) {
    console.log('Unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user_id = req.session.user_id;
    const timestamp = new Date().valueOf();
    const uniqueFilename = `U${timestamp}-${req.file.originalname}`;
    const filePath = path.join(__dirname, 'images', uniqueFilename);

    console.log(`Saving file: ${filePath}`);

    // Write the file to the 'images' directory with a unique name
    await fs.promises.writeFile(filePath, req.file.buffer);

    console.log('File saved successfully');

    // Create a new photo object in the database
    const photoData = {
      file_name: uniqueFilename,
      date_time: new Date(timestamp),
      user_id: user_id,
      comments: [],
      is_sharing_enabled: false
    };

    // Handle sharing list if provided
    if (req.body.sharing_list) {
      photoData.is_sharing_enabled = true;
      photoData.sharing_list = JSON.parse(req.body.sharing_list);
    }

    const newPhoto = new Photo(photoData);
    await newPhoto.save();

    console.log('Photo uploaded successfully');

    await Activity.create({
      user_id: req.session.user_id,
      activity_type: 'PHOTO_UPLOAD',
      photo_id: newPhoto._id
    });

    // Respond with status 200 as expected by the test
    return res.status(200).json(newPhoto);
  } catch (err) {
    console.error('Error handling photo upload:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/photos/:photo_id/like', requireLogin, async (req, res) => {
  const user_id = req.session.user_id;
  const { photo_id } = req.params;

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.likes.includes(user_id)) {
      return res.status(400).json({ error: 'Photo already liked' });
    }

    photo.likes.push(user_id);
    await photo.save();

    await Activity.create({
      user_id: user_id,
      activity_type: 'USER_LIKE',
      photo_id: photo._id
    });

    return res.status(200).json({ success: true, likes: photo.likes.length });
  } catch (err) {
    console.error('Error liking photo:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/photos/:photo_id/unlike', requireLogin, async (req, res) => {
  const user_id = req.session.user_id;
  const { photo_id } = req.params;

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const likeIndex = photo.likes.indexOf(user_id);
    if (likeIndex === -1) {
      return res.status(400).json({ error: 'Photo not liked' });
    }

    photo.likes.splice(likeIndex, 1);
    await photo.save();

    return res.status(200).json({ success: true, likes: photo.likes.length });
  } catch (err) {
    console.error('Error unliking photo:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities endpoint
app.get('/activities', requireLogin, async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ date_time: -1 })
      .limit(5)
      .populate('user_id', 'first_name last_name')
      .populate('photo_id', 'file_name');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/photos/:photo_id', requireLogin, async (req, res) => {
  const userId = req.session.user_id;
  const { photo_id } = req.params;

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).send({ error: 'Photo not found' });
    }

    if (photo.user_id.toString() !== userId) {
      return res.status(403).send({ error: 'Unauthorized to delete this photo' });
    }

    await Photo.findByIdAndDelete(photo_id);
    res.status(200).send({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.delete('/photos/:photoId/comments/:commentIndex', requireLogin,async (req, res) => {
  const { photoId, commentIndex } = req.params;

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    if (commentIndex < 0 || commentIndex >= photo.comments.length) {
      return res.status(400).send('Invalid comment index');
    }

    photo.comments.splice(commentIndex, 1);
    await photo.save();
    res.status(200).send('Comment deleted successfully');
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Internal server error');
  }
});

app.delete('/users/:user_id', requireLogin, async (req, res) => {
  const loggedInUserId = req.session.user_id;
  const { user_id } = req.params;

  if (loggedInUserId !== user_id) {
    return res.status(403).send({ error: 'Unauthorized to delete this account' });
  }

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Delete associated photos
    await Photo.deleteMany({ user_id });

    // Delete user comments from all photos
    await Photo.updateMany(
        {},
        { $pull: { comments: { user_id } } }
    );

    // Remove user likes from all photos
    await Photo.updateMany(
        {},
        { $pull: { likes: user_id } }
    );

    // Delete the user account
    await User.findByIdAndDelete(user_id);

    req.session.destroy();
    res.status(200).send({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send({ error: 'An error occurred while deleting the account' });
  }
});




const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
      "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});