<h1>
<a href="https://www.techworld-with-nana.com/devops-bootcamp"><img align="right" src="assets/img/twn-devops-thumbnaill.png" width="150"></a>

📖 7 - Containers with Docker
</h1>

## 📋 Bootcamp Curriculum

<h3 align="center">DevOps Prerequisites</h3>
<p align="center">
    1 - Introduction to DevOps (no repository) •
    2 - Operating Systems & Linux Basics (no repository)<br>
    3 - Version Control with Git (no repository) •
    <a href="https://github.com/timmartinberger/build-tools-exercises/tree/main">4 - Build and Package Management Tools</a>
</p>

<h3 align="center">DevOps Fundamentals</h3>
<p align="center">
    <a href="">5 - Cloud & Infrastructure as Service</a> •
    <a href="">6 - Artifact Repository Manager with Nexus</a> •
    <a href=""><b>🔖 7 - Containers with Docker</b></a>
</p>

<h3 align="center">DevOps Core</h3>
<p align="center">
    <a href="">8 - Build Automation & CI/CD with Jenkins</a> •
    <a href="">9 - AWS Services</a><br>
    <a href="">10 - Container Orchestration with Kubernetes</a> •
    <a href="">11 - Kubernetes on AWS - EKS</a>
</p>

<h3 align="center">DevOps Advanced</h3>
<p align="center">
    <a href="">12 - Infrastructure as Code with Terraform</a> •
    <a href="">13 - Programming Basics with Python</a><br>
    <a href="">14 - Automation with Python</a> •
    <a href="">15 - Configuration Management with Ansible</a> •
    <a href="">16 - Monitoring with Prometheus</a>

</p>

---

## 🔻 Scope of this Module
- Building apps with Docker 
- Run multi-service apps consisting of a database and a web app using `docker compose`
  - Usage of volumes for persistent data
  - Environment variables to maintain database connections
- Pushing Docker images to the artifact repository Nexus3
- Run apps on the remote cloud server created at DigitalOcean

![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=Docker&logoColor=white) ![Ubuntu](https://img.shields.io/badge/-Ubuntu-E95420?logo=Ubuntu&logoColor=white) ![DigitalOcean](https://img.shields.io/badge/-DigitalOcean-0080FF?logo=DigitalOcean&logoColor=white) ![Nexus](https://img.shields.io/badge/-Sonatype_Nexus-1B1C30?logo=sonatype&logoColor=white) ![Java](https://img.shields.io/badge/-Java-E34F26?logo=java&logoColor=white) ![Gradle](https://img.shields.io/badge/-Gradle-02303A?logo=Gradle&logoColor=white) ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=MySQL&logoColor=white) ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=MongoDB&logoColor=white) ![phpMyAdmin](https://img.shields.io/badge/-phpMyAdmin-6C78AF?logo=phpmyadmin&logoColor=white)


### Projects
#### [01-js-app](01-js-app)
A small JavaScript app that connects to a MongoDB database, whereas both the JS app and the database were containerized using Docker.
#### [02-nexus-docker](02-nexus-docker)
A **_docker-compose.yaml_** to start Nexus3 on the DigitalOcean droplet with. This compose file already contains the settings for the port forwarding and the volume, so that the Nexus service can be started with the one liner `docker compose up -d`.
#### [03-docker-exercises](03-docker-exercises)
This is a small Java app that connects to a MySQL database. Detailed information can be found in the project directory. In summary the following things were done:
- The Java app was build using gradle.
- A remote Nexus3 server was set up on a cloud server from DigitalOcean.
- The Java app was pushed a docker repository in Nexus.
- On the remote server the app and a MySQL database were started using `docker compose`.
- Sensitive data was handled using environment variables to avoid exploitation of hard coded credentials in the source code.



### Lecture Notes
[Click here](NOTES.md).

---

## 🌟 Acknowledgement

This repository was created as part of the TechWorldWithNana DevOps Bootcamp.<br>
<a href="https://www.techworld-with-nana.com/devops-bootcamp">DevOps Bootcamp</a> • <a href="https://www.youtube.com/@TechWorldwithNana"><svg fill="#c4302b" width="24px" height="24px" viewBox="0 -8 32 32" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M24.325 8.309s-2.655-.334-8.357-.334c-5.517 0-8.294.334-8.294.334A2.675 2.675 0 0 0 5 10.984v10.034a2.675 2.675 0 0 0 2.674 2.676s2.582.332 8.294.332c5.709 0 8.357-.332 8.357-.332A2.673 2.673 0 0 0 27 21.018V10.982a2.673 2.673 0 0 0-2.675-2.673zM13.061 19.975V12.03L20.195 16l-7.134 3.975z"></path></g></svg> TechWorld with Nana</a>