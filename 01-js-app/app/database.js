// Import MongoDB client node module
let MongoClient = require('mongodb').MongoClient;


/* NOTE: The following urls contain credentials that should not be in the code, but rather in a .env file.
 *       For this demo it is keep to focus on building the docker services.
 */

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
let userColName = "users";


let conn;
let db;

async function getDB() {
    if (db) return db;

    try {
        let dbClient = new MongoClient(mongoUrlDockerCompose, mongoClientOptions);
        conn = await dbClient.connect();
        db = conn.db(dbName);
        let userCol = db.collection(userColName);
        userCol.createIndex( { "user": 1 }, { unique: true } );
        console.log("Database connected successfully");
        return db;
    } catch(e) {
        console.error(e);
        return;
    }
}


module.exports = {
    getDB: getDB,
    userColName: userColName
}