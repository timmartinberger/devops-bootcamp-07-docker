var express = require('express');
var path = require('path');
var fs = require('fs');

var { getDB, userColName } = require('./database')

var app = express();


// Package to parse http response bodies
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/api/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, `images/${req.query.user}.jpg`));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

function profileDataComplete(profileData) {
  // Checks whether the user data is complete
  return (profileData && profileData.user && profileData.name && profileData.mail && profileData.interests)
}

// Add further get and post requests to fetch and post data from and to the database
app.get('/api/profile', async function(req, res){
  // DB
  try {
    let user = req.query.user;
    if (!user) throw new Error("Invalid user");
    let db = await getDB();
    let userCol = db.collection(userColName);
  
    let profileData = await userCol.findOne({user: user});
    if(!profileDataComplete(profileData)) {
      throw new Error("Unkown user");
    }
    
    res.end(JSON.stringify(profileData));
  } catch(e) {
    res.end(JSON.stringify({
      err: e
    }))
    console.error(e)
  }
});


app.post('/api/profile', async function(req, res){
  
  try {
    // Data to insert
    let profileData = req.body;
    if(!profileDataComplete(profileData)) {
      throw new Error("Incomplete profile data");
    }
    // DB
    let db = await getDB();
    let userCol = db.collection(userColName);
    let updateRes = await userCol.updateOne({user: profileData.user}, { $set: profileData }, {upsert: true})
    console.log(updateRes)
    if (updateRes.modifiedCount !== 1 && updateRes.upsertedCount) {
      throw new Error("Unable to write to db")
    }
    
    // Return success if stored successfully
    res.end(JSON.stringify({
      "success": true
    }));
  } catch(e) {
    res.end(JSON.stringify({
      err: e
    }))
    console.error(e)
  }
  
});


app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
