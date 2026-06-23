var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

// Import MongoDB client node module
let MongoClient = require('mongodb').MongoClient;
// Package to parse http response bodies
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// If the Node.js app is started directly on the host one has to use localhost:port to reach the database
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
/* If the Node.js app is started as a docker container within the same docker network as the database,
 * then the container name can be used instead of localhost:port.
 * This is the default, when using docker compose to build all these services using the docker-compose.yml config file
 */
let mongoUrlDockerCompose = "mongodb://admin:password@mongodb";


let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

 // Database as specified in the Mongo Express UI
let dbName = "user-account";
let collectionName = "users";


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// Add further get and post requests to fetch and post data from and to the database
app.get('/profile', function(req, res){

});


app.post('/profile', function(req, res){
  let db = cl
});


app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
