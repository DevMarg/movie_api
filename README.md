# Movie_API



## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
- [Deployment to Heroku](#deployment-to-heroku)
- [Endpoints](#endpoints)
  - [Movies](#movies)
  - [Users](#users)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Hosting](#hosting)


### Prerequisites

- Node.js
- MongoDB Atlas account or a local MongoDB instance
- Heroku account for hosting (you can do it locally)

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

1. Create a `.env` file in the root directory and add your MongoDB connection string:

   ```sh
   CONNECTION_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<your-database>?retryWrites=true&w=majority

2. Add a port to your `.env` file:  

    ```sh
   PORT=8080
   ```
3. Start the server in the terminal:

    ```sh
    node index.js
    ```

3. ### Deployment to Heroku

If you are deploying your application directly to Heroku and have configured your MongoDB connection through Heroku config vars, here's how you can connect:

1. **Heroku Config Vars Setup:**
   - Make sure you have set up the `CONNECTION_URI` config var on your Heroku app's settings. This should already contain your MongoDB connection string.

   Example: mongodb+srv://<username>:<password>@<clusterName>.mongodb.net/<dataBaseName>?retryWrites=true&w=majority&<appName>

2. **MongoDB Atlas Connection:**
   - If you need to retrieve or update your MongoDB Atlas connection string, follow these steps:
     - Log in to your MongoDB Atlas account.
     - Navigate to your Cluster.
     - Click on the "Connect" button.
     - Copy the connection string provided.
     - Ensure that your connection string includes the correct username, password, cluster URL, and database name.

For detailed instructions on managing your MongoDB connection string, refer to [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/troubleshoot-connection/#special-characters-in-connection-string-password).


