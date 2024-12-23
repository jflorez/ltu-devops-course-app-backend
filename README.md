# Speedrun App

Welcome to the Speedrun App! This application is designed to manage and track speedruns for various games, providing a comprehensive API for interacting with speedrun data.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Game Management**: Add, update, and delete games.
- **User Management**: Manage users who participate in speedruns.
- **Category Management**: Define and manage categories for speedruns.
- **Speedrun Tracking**: Create, update, and delete speedruns.
- **API Security**: Secure API endpoints with an API key.

## Installation

To get started with the Speedrun App, follow these steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/speedrun-app.git
    cd speedrun-app
    ```

2. **Install dependencies**:

    ```bash
    yarn install
    ```

3. **Set up environment variables**: Create a `.env` file in the root directory and configure the following variables:
    ```plaintext
    MARIADB_USER=your_db_user
    MARIADB_PASSWORD=your_db_password
    MARIADB_DATABASE=your_db_name
    MARIADB_HOST=your_db_host
    EXPRESS_PORT=your_express_port
    APP_API_TOKEN=your_api_token
    ```
4. **Run the database**:

    ```bash
    yarn db:up
    ```

5. **Start the application in dev mode**:
    ```bash
    yarn start-dev
    ```

## Usage

The application provides a RESTful API to manage speedruns. You can interact with the API using tools like `curl`, `Bruno`, or any HTTP client library.

## API Documentation

The API documentation is available via Swagger UI. Once the application is running, you can access the documentation at `http://localhost:<EXPRESS_PORT>/docs`.

## Testing

The application includes a suite of tests to ensure functionality. To run the tests, use the following command:

```bash
yarn test
```
