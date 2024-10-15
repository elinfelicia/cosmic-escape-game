# Cosmic Escape Game

Cosmic Escape is an interactive text-based adventure game where players navigate through a spaceship filled with dangers and enemies. The goal is to make the correct choices to escape the ship.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [MongoDB](https://www.mongodb.com/) (for local development) or access to a MongoDB Atlas account
- [Git](https://git-scm.com/) (to clone the repository)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/elinfelicia/cosmic-escape.git
   cd cosmic-escape
   ```

2. Install the server dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install the client dependencies:

   ```bash
   cd ../cosmic-escape
   npm install
   ```

## Environment Variables

Create a `.env` file in the `server` directory and add the following variables:
MONGODB_URI=your_mongodb_uri
PORT=4000
OPENAI_API_KEY=your_openai_api_key


### Explanation of Environment Variables:

- `MONGODB_URI`: The connection string for your MongoDB database. Replace `<username>`, `<password>`, and `<your-cluster-url>` with your MongoDB credentials and cluster information.
- `PORT`: The port on which the server will run (default is 4000).
- `OPENAI_API_KEY`: Your OpenAI API key for generating scenarios in the game.

## Running the Application

1. Start the server:

   ```bash
   cd server
   npm start
   ```

2. In a new terminal window, start the client:

   ```bash
   cd cosmic-escape
   npm run dev
   ```

3. Open your web browser and navigate to `http://localhost:3000` to play the game.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details

