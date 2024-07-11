# Movie_API

This is a RESTful API for managing a movie database. It provides endpoints for accessing and managing information about movies, genres, directors, and users. Built with Node.js, Express and MongoDB, this API supports user authentication with JWT and is designed for both local development and deployment on Heroku.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
- [Deployment to Heroku](#deployment-to-heroku)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Hosting](#hosting)


### Prerequisites

- Node.js
- MongoDB Atlas account or a local MongoDB instance
- Heroku account for hosting (you can also do it locally)

### Installation

1. **Clone the repository:**

   Clone the repository to your local machine.

   ```sh
   git clone https://github.com/DevMarg/movie_api.git
   cd movie_api

2. Install dependencies:

   ```sh
   npm install
   ```
 ### Local Development

1. Create a `.env` file in the root directory and add your MongoDB connection string.

   ```sh
   CONNECTION_URI=mongodb+srv://<username>:<password>@<clusterName>.mongodb.net/<dataBaseName>?retryWrites=true&w=majority&<appName>   

2. Add a port to your `.env` file:  

    ```sh
   PORT=8080
   ```
3. Start the server in the terminal:

    ```sh
    node index.js
    ```

 ### Deployment to Heroku

If you are deploying your application directly to Heroku and have configured your MongoDB connection through Heroku config vars, here's how you can connect:

1. **Heroku Config Vars Setup:**
   Make sure you have set up the `CONNECTION_URI` config var on your Heroku app's settings. This should already contain your MongoDB connection string.

   Example: mongodb+srv://<username>:<password>@<clusterName>.mongodb.net/<dataBaseName>?retryWrites=true&w=majority&<appName>

   Official Heroku documentation with detailed instructions: [Deploying Node.js Apps on Heroku](https://devcenter.heroku.com/articles/deploying-nodejs).

2. **MongoDB Atlas Connection:**
   - If you need to retrieve or update your MongoDB Atlas connection string, follow these steps:
     - Log in to your MongoDB Atlas account.
     - Navigate to your Cluster.
     - Click on the "Connect" button.
     - Copy the connection string provided.
     - Ensure that your connection string includes the correct username, password, cluster URL, and database name.

For detailed instructions on managing your MongoDB connection string, refer to [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/troubleshoot-connection/#special-characters-in-connection-string-password).

## Endpoints

Please refer to the documentation file for detailed information about the available endpoints.

## Error Handling

Errors are managed through a middleware function that captures them and returns a JSON response with the corresponding status code and message.

## Authentication

This API uses JSON Web Tokens (JWT) for authentication. To access protected routes, you need to include a valid JWT token in the Authorization header of your requests, formatted as `Bearer <your-token>`.

### Login

To log in and receive a JWT token, use the following endpoint:

- **POST /login**
  - Request body parameters: `Username`, `Password`.
  - Example: `https://movie-spot-a025d6d649af.herokuapp.com/login`

## Hosting

The Movie_API is hosted on Heroku. You can access it at: [https://movie-spot-a025d6d649af.herokuapp.com/](https://movie-spot-a025d6d649af.herokuapp.com/)


