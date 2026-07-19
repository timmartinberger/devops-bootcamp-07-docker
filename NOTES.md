# 07 - Containers with Docker

## 2 - What is a Container

* Portable package of an application with everything need for deployment
  * Portable → Stored in **container repository** (e., g. Docker Hub)
* Containers are an isolated environment → **no dependencies installed to host**
* Having different versions of the same application possible without conflict



### Without containers

* Installing dependencies directly to the host
* Installation process is **different** on distinct OS → tedious and error-prone
* Traditional development process:
  * Dev team creates app artifacts and setup instructions
  * Database service with setup instruction
  * Operations team sets up production server
* Problem with traditional approach:
  * Everything is installed directly on the prod OS → **conflicts possible**
  * Misunderstanding between devs and ops lead to errors



### Development with containers

* Development and Operation in one team
* No environmental config needed on server (except docker itself)

  → "one command" runnable container is delivered

***

## 2 - Container vs Image

* Container = Layer of images
  * Bottom layer is **Linux** in most cases → this keeps them small
  * Top layer is the application (e., g. MongoDB or Jenkins)
  * Advantage of layers:
    * In case of adaptions in the docker app **only the layers that differ have to be downloaded again**
    * More efficient storing
* Run a postgres container

```shell
# Run command with one environment variable
docker run -e POSTGRES_PASSWORD=mysecretpassword postgres_13:10
```

* Show running containers with `docker ps`



### Images vs. Containers 

* Image = actual package / artifact
  * portable
* Container = a running instance of an image

***

## 3 - Docker vs. Virtual Machine

### OS architecture

* Operating systems have two layers → Kernel and application layer

![](assets/notes/SIrjx3ga4bHmwH6rqnM51k_rM5sYMBZYNdrIXUev50c=.jpeg)



### Docker

* Docker **virtualizes only** the application layer
* Containers rely on docker runtime environment
* Small, fast startup
* Linux images not natively compatible with Windows 

  → Docker Desktop uses a Hypervisor Layer to run Linux images



### Virtual Machines

* VMs **virtualize** the **OS and the application layer** → the complete OS
* Can work standalone
* Large images, startups may take minutes
* Every host OS can run every other OS in a VM

***

## 4 - Docker Architecture and components

* **Docker Engine**
  * Server → Pull images, managing images and containers
    * Container runtime → Manages container lifecycle
    * Volumes → Persisting data
    * Network → Communication between containers
    * Build Images
  * API → Interacting with Docker Server
  * CLI → Command line interface for command execution

**→ All that in one tool**



* In case only a container runtime is needed → **containerd, cri-o**
* In case only image building is desired → **buildah**

***

## 5 - Main Docker Commands

* Pull image from registry
  ```shell
  docker pull redis
  ```
* Run image as a container
  ```shell
  docker run -d -p 6000:6379 redis:6.2
  ```
  * `-d` start detached
  * `-p <host>:<container>` bind host port to container port
* Stop a running container
  ```shell
  docker stop <container-id>
  ```
* Show running containers
  ```shell
  docker ps -a
  ```
  * `-a` show ALL containers, including those that ran in the past

***

## 6 - Debug Commands

* Display container logs
  ```shell
  docker log <container-id>
  ```
* Give containers a custom name (for easier debugging)
  ```shell
  docker run -d -p6000:6379 --name redis-old redis:6.2
  ```
  * Now, instead of the container ID the name can be used for arbitrary commands
* Get into the containers terminal
  ```shell
  docker exec -it redis-old bash
  ```
* `docker run` vs. `docker start`
  * `docker run` creates a new container
  * `docker start` is used to restart an old / stopped container

***

## 8 - Developing with Docker [01-js-app]

### Docker Network

* Docker can create isolated docker networks
  * Containers can speak to each other
  * Container names are used in Dockers built in DNS → No IPs needed
  ```shell
  docker network create mongo-network
  ```

Now run a **MongoDB** (the actual database) docker instance within the created docker network

```shell
docker run -d \
  -p 27017:27017 \  # Port binding
  --network mongo-network \  # Make the container part of the docker network created above
  -e MONGO_INITDB_ROOT_USERNAME=admin \  # Set username and password required by MongoDB
  -e  MONGO_INITDB_ROOT_PASSWORD=password \
  --name mongodb \  # Set a container name
  mongo  # Name of the image
```



Start **Mongo Express** (web UI for MongoDB)

```shell
docker run -d \
  -p 8081:8081 \
  --network mongo-network \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password \
  -e ME_CONFIG_BASICAUTH_USERNAME=user \
  -e ME_CONFIG_BASICAUTH_PASS=pass \
  -e ME_CONFIG_MONGODB_SERVER=mongodb \
  -e ME_CONFIG_MONGODB_URL=mongodb://mongodb:27017 \
  --name mongo-express \
  mongo-express
```

* `-p` Port binding
* `--network` Docker network the container should join
* `-e` Necessary environment variables
* `--name` Container name



On http://localhost:8081  create a database admin-account (could have also been done using further environment variables)

* Login with credentials set in environment variables of the `docker run` command **user:pass**

![](assets/notes/Mm3Fq1r_Sz_To_5jpwdf9gpDCrSvd8co5Ho59AA7gJs=.png)

### Adaptions to the code

* I outsourced the MongoDB client creation to a ***database.js*** file that exports the DB. The DB is provided to the ***server.js*** using and getter function to handle the async database connection establishment 
  ```javascript
  /*** Extract showing the DB client creation ***/

  // Url to reach the local MongoDB server
  // Note: In a real project these creds should not be in the source code, but rather in an .env file
  let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

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

  // Export the getDB function to provide it to other modules
  module.exports = {
      getDB: getDB,
      userColName: userColName
  }
  ```
* To handle incoming requests to fetch data from or write it to the database further HTTP endpoints were added to the ***server.js***
  ```javascript
  /*** Extract from server.js that shows API endpoints for profile data ***/

  function profileDataComplete(profileData) {
    // Checks whether the user data is complete
    return (profileData && profileData.user && profileData.name && profileData.mail && profileData.interests)
  }

  // Add further get and post requests to fetch and post data from and to the database Endpoint to fetch profile data
  app.get('/api/profile', async function(req, res){
    // DB
    try {
      // The user is provided as a query parameter
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


  // Endpoint to write profile data
  app.post('/api/profile', async function(req, res){
    try {
      // Data to insert
      let profileData = req.body;
      if(!profileDataComplete(profileData)) { 
        // Early checks for incomplete data
        throw new Error("Incomplete profile data");
      }
      // DB
      let db = await getDB();
      let userCol = db.collection(userColName);
      let updateRes = await userCol.updateOne({user: profileData.user}, { $set: profileData }, {upsert: true})
      console.log(updateRes)
      if (updateRes.modifiedCount !== 1 && updateRes.upsertedCount) {
        // Check whether write was successful
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

  ```

> 💡The provided solution uses the endpoints `/update-profile` and `/get-profile`. These names incorporate the actions performed on the database resources. 
>
> However since it is actually a best practice to have one endpoint for a resource and define the action through the used HTTP methods (GET, POST, PUT, etc.) I named the endpoint `/api/profile` and assigned a GET and a POST request processor to the API.

* The **index.html** was adapted as well to call the endpoints above (see source file)



After all I can access the user profiles in my app by passing the **user** as a **query parameter** (unfortunately the images are not representative anymore :( ):

![](assets/notes/ojpZJH2iGHw3w_TJiyVv6Rl0Da_IjvgDAUkFqaPs76w=.png)

![](assets/notes/mKQ6YbZza0a_Z9gtarhiQ2OBx9XHJWNNGBivUnMtlVA=.png)

* The user data is stored in the database

![](assets/notes/2GoiWWtK8XQ5uGsdX8dBFQTtYHdLWsHreblsg1hlvBM=.png)

> **Note:** A username is added in order to have a unique human-readable identifier

![](assets/notes/iOGLOtCCqetPg5oQ51eFC-GJq2vnoFK-0h73O_WtR-I=.png)

***

## 9 - Docker Compose - Run multiple Docker containers

### Current setup process → tedious 

* Containers have to be started one by one
* A docker network cas to be created manually
* Volumes have to be created manually
* Passing multiple command line arguments, when creating these things

### Docker compose → automated setup

* Automatic start of containers, volumes and networks including corresponding command line configurations
  ```yaml
  services:
    my-app:  # Service 1 - Container name
      image: my-app:1.0.0  # Image
      build: . # Build the image from current directories Dockerfile
      ports: # Port binding <host>:<container>
       - 3000:3000
    mongodb:  # Service 2 - Container name
      image: mongo
      ports:
       - 27017:27017
      environment: # Env variables
       - MONGO_INITDB_ROOT_USERNAME=admin
       - MONGO_INITDB_ROOT_PASSWORD=password
      volumes: # Volumes
       - mongo-data:/data/db
    mongo-express:  # Service 3 - Container name
      image: mongo-express
      restart: always
      ports:
       - 8081:8081
      environment:
       - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
       - ME_CONFIG_MONGODB_ADMINPASSWORD=password
       - ME_CONFIG_MONGODB_SERVER=mongodb
      depends_on:
       - "mongodb"
  volumes:  # Docker volume for persistence data
    mongo-data:
      driver: local
  ```
* Docker compose automatically create a common network for these services
* Docker compose → declarative way to describe how a docker setup should look like



### Further docker compose fields

* `restart: always` → Restart the container in case an internal error occurs and the container stops
* Declare an order in which the services should start
  ```yaml
  services:
    mongodb:
      ...
    mongo-express:
      depends_on: # mongo-express starts after mongodb has started
        - "mongodb"
      ...
  ```



### Start with docker compose

```shell
docker compose up -d  # -d for detached start
```

### Persistence of data

* Data stored **inside a container** sets **lost** after each restart
* To have persistent data across service restarts → **use volumes** (shown in full ***docker-compose.yaml*** above)

***

## 10 - Dockerfile - Build your own Docker Image

### Dockerfile

* Blueprint that describes how a docker file should be created
* **Structure:**
  1. `FROM node:20-alpine` → base image with Node.js installed (or any other runtime env depending on the used language)
  2. Defining environment variables (Possible in a **Dockerfile**, but better would be in a ***docker-compose.yaml*** + ***.env***)
     ```docker
     ENV MONGO_DB_USERNAME=admin \
         MONGO_DB_PWD=password
     ```
  3. **`RUN`**`mkdir -p /home/app` → Run Linux commands for initial setup during image build
  4. **`COPY`**` ./app /home/app`  → Copy content from the host to the image
  5. **`WORKDIR`**` /home/app` → Sets ***/home/app*** as the default working directory inside the image
  6. **`CMD`** `["node", "server.js"]` → Command that should run on container startup (only one per **Dockerfile**)

     **→ This is the entrypoint for my app**



### Build image from Dockerfile

```shell
#            -t <image-tag>  location
docker build -t my-app:1.0.0 .
```

* **Notes on building images:** 
  * Always install the dependencies inside the image. **DO NOT** copy them from host to the image → Rebuilding keeps the image up to date
  * Only copy files to the image that are **ACTUALLY needed** during runtime → copy this content to an ***app*** directory and copy that to the image or write a ***.dockerignore*** to avoid certain files being copied



On my local development setup I built my-app directly with ***docker-compose.yaml*** with:

```yaml
services:
  my-app:
    image: my-app:1.0.0
    build: .  # To build the image using the local Dockerfile
    ports:
     - "3000:3000"
```

![](assets/notes/ceRJSE3Nftnjme2sJV-yFejn9rYsni3k-B36Rptb0TY=.png)

* For debugging the running app can be entered with the `docker exec` command

  ![](assets/notes/KmoCqgZlSA4UfNiSpLSDKmMLBZpxeiiTSF-N8O-OVx0=.png)
* The image above shows the environment variables set in the Dockerfile with
  ```docker
  ENV MONGO_DB_USERNAME=admin \
      MONGO_DB_PWD=password
  ```
  and the files created during image build.

***

## 11 - Private Docker Repository

* Nexus can be used as a Docker repository as well. For docker an http connector has to be set:

  ![](assets/notes/FYa0va3AEtG07qwAY4AC4j0DGzhERJkYctqlyiban9s=.png)

  ![](assets/notes/UM2850kC6e496P6_ePYAVouKkNOT7dm8kgvxtwzwvhk=.png)
* The corresponding firewall rule has to be set for the DigitalOcean server that runs the Nexus instance

  ![](assets/notes/vqq9NeocGXJCcKTUozMcTZ0GZoE6TmwIp1mQ6UimfE0=.png)
* To make that repo accessible to users a role with the privilege `nx-repository-view-docker-*-*` has to be created and assigned to a user

  ![](assets/notes/COLBrgaO-NucXTbk6gcWI-BEDPNGkzqdidb68H2Wiy0=.png)
* For authentication with Nexus the **Docker Bearer Token Realm** has to be activated for issuing of access tokens

![](assets/notes/rdjzLI35pxbVM-JgFxwmiLZPviT1xRIXD1czJ7XXGeM=.png)

* Since I do not have a valid ssl certificate for my Nexus server, this registry has to be allowed to be accessed by adding the following part to the ***/etc/docker/daemon.json file***
  ```json
  {
      "insecure-registries" : [ "104.248.29.106:8082" ]
  }
  ```
  * Docker has to be restarted with `systemctl restart docker` to apply these config changes
* Now the local user has to authenticate the private Nexus repository with the Docker cli

  ![](assets/notes/4FyZ19pbNdSPk15BAb9Jf9cTIGaFg7YBUN7dPLLzjcY=.png)



### Pushing an images to a private registry

* Image naming in docker registries incorporate the registry domain:

  `registryDomain/imageName:tag`
* For my Nexus server it is:
  `104.248.29.106:8082/my-app:1.0.0`
* So the image I created before has to be tagged

  ![](assets/notes/y8wFAKaGwlMJ7KymM_75FVFuKCSoNJ0_RlcPbC3IDAA=.png)
* And then pushed with docker push `104.248.29.106:8082/my-app:1.0.0`

  ![](assets/notes/OoPMUhuUHDwgPoOU-UA-x1zqGYguF4vegd7fQ5fcPso=.png)
* The image can now be found in the Nexus url

  ![](assets/notes/azW1XqkmY41J9bw0gV4IkEPG7WjRPg0Rbs6AI1FTG0s=.png)
* Using the Nexus API I can see the pushed artifact
  ```shell
  curl -u timmy:iamawhale -X GET 104.248.29.106:8081/service/rest/v1/components?repository=docker-hosted
  ```
  ![](assets/notes/Ta0aiQbzORpVfjXT3LI7Za-dsozilr01itE39_0QfyM=.png)

***

## 12 - Deploy docker application on a server

### Pulling file from a private registry

* To build my services and download my custom app from my private repo the ***docker-compose.yaml*** is adjusted:
  ```yaml
  services:
    my-app:
      image: 104.248.29.106:8082/my-app:1.0.0  # Including the domain
      ports:
       - 3000:3000
    mongodb:
    # ...
  ```
* To make my-app capable to access the database when it is also part of the docker network, then a different url that includes the service name has to be used:
  ```javascript
  //                          protocol://<creds>       @serviceName
  let mongoUrlDockerCompose = "mongodb://admin:password@mongodb";
  ```
* This adjustment has to be pushed as before
* Now these services can be started using `docker compose up -d` again

***

## 13 - Docker Volumes - Persisting Data

* Containers have virtual file systems → data is lost on container restart
* Volumes are a mount of the host file system into the virtual container file system 



### Three types of volumes

1. Host volumes: `docker run -v /home/mount/data:/var/lib/mysql/data`
   * User decides which host directory is mounted
2. Anonymous volumes: `docker  run -v /var/lib/mysql/data`
   * Docker creates the host mount point on its own
3. Named volumes: `docker  run -v name:/var/lib/mysql/data`
   * Logical reference to the folder on the host → The host directory mount point does not have to be remembered or retyped
   * **→ Should be used in production!**



### Volumes in docker-compose.yaml

```yaml
services:
  mongodb:
    image: mongo
    # ...
    volumes:
     - mongo-data:/data/db  # <vol>:<container-data>
  # Other services ...

# The docker compose has to list all volumes
volumes:
  mongo-data:
```

***

## 15 - Docker Nexus as Docker Container

### This lecture: Deploy Sonatype Nexus to a new DigitalOcean Droplet

1. Create a new droplet (see [module 05](https://github.com/timmartinberger/devops-bootcamp-05-cloud-iaas)) and set firewall rules

   ![](assets/notes/UdbIw7g_dYdC8ARK9OCdjPoWftv7rFjxQiXhZOxfXpo=.png)
2. `ssh` to the droplet

   ![](assets/notes/86nKia715XUHzpATD_842KQUShVnq_V9xu0Gp5a41e0=.png)
3. Install docker with `apt update && snap install docker` 
4. Search for a Nexus image on hub.docker.com
5. Configure Nexus for docker, including a volume for persistent data. Instead of creating it using a bunch of commands, I will write a docker compose:
   ```yaml
   services:
     nexus:
       image: sonatype/nexus3:3.94.0
       ports:
         - 8081:8081
       volumes:
         - nexus-data:/nexus-data
   volumes:
     nexus-data:
       driver: local
   ```

* The volume can be checked using `docker volume ls`
  * `docker inspect <volume-name>` outputs further information including the physical mount point

1. After executing `docker compose up -d` the nexus container as well as the volume start up

   ![](assets/notes/CiTMftNmu7VWRAKdJaq7PrwaNlP2qN7kItMwlFvQSHo=.png)



Now the Nexus instance installed with docker is available under http://134.209.255.127:8081/nexus/#welcome:

![](assets/notes/E5Sqogt_tYux87q8Ljqcg4iUs_z5T5QKDNxRHGNnuVQ=.png)

> **Note:** I accidentally used Nexus 2 here. Of course the Nexus 3 would be a better option to get the latest features and security fixes.

### Advantages of this approach

* Only one program has to be installed on the server → Docker
* The entire structure can be defined in a single file → ***docker-compose.yaml***
* Docker isolates Nexus from the remaining system → Better security
* Most images creates specific users to run the software inside the container by default → Inside the container there is no root user executing software
  * This can be checked by investigating the image layers of the pulled image on hub.docker.com 

***

## 16 - Docker Best Practices



### Image selection

* Use an **official docker image** as base image whenever possible
* Use a **specific image** version instead of the `latest` tag
* Use the smallest base image possible → `alpine` instead of `ubuntu`
  * This makes the image smaller and more secure, since fewer tools to exploit are available

```docker
FROM node:20.0.2-alpine
```

### Build process

* Optimize caching image layers
  * Put commands that does not apply changes often to the image first → install dependencies before copying code to the image
  * Cleanup build cache within the same layer: 
    ```docker

    # Cache cleanup example for python/pip
    RUN pip install --no-cache-dir -r requirements.txt && \
        rm -rf /root/.cache/pip
    ```
* Only copy files to the image that are necessary during runtime
  * Write a ***.dockerignore*** to exclude files
* Cleanup artifacts that are only needed during build time, e.g. maven, jdk, etc. 

  **→ Multi-stage builds**
* Define a non-root user to run the application inside the container
  * Most base images already have a generic user with the less privileges than root
  ```docker
  ...
  # Create group and user
  RUN groupadd -r tom && useradd -g tom tom

  # Give the new user:group the necessary file ownership
  RUN chown -R tom:tom /app

  # Switch to that user
  USER nexus
  ...
  ```


### Multi-Stage Build - Example

```docker
# Build stage 
FROM maven as build
WORKDIR /app
COPY myapp /app
RUN mvn package

# Run stage
FROM tomcat
COPY --from=build /app/target/file.war /usr/local/tomcat/ ..
...
```

→ Separates runtime dependencies from build dependencies



### Scan for vulnerabilities

```shell
docker scout cves 104.248.29.106:8082/my-app:1.0.0
```

→ This searches for known vulnerabilities in any layer of the image, even in self built images

