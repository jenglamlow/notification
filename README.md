# Notification Microservice

This microservice is a scalable and extensible system for handling user notifications across various channels like Email and UI. It is built with NestJS, TypeScript, and MongoDB.

## Table of Contents

- [Notification Microservice](#notification-microservice)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation \& Running the Project](#installation--running-the-project)
  - [Running Tests](#running-tests)
  - [API Endpoints](#api-endpoints)
    - [1. Send a Notification](#1-send-a-notification)
    - [2. Get UI Notifications for a User](#2-get-ui-notifications-for-a-user)

---

## Architecture Overview

The system is designed with a clean, decoupled architecture that emphasizes flexibility and testability.

-   **Controller Layer**: Handles incoming HTTP requests, validates payloads (DTOs), and calls the appropriate service.
-   **Service Layer**: Contains the core business logic. The `NotificationService` orchestrates the process of fetching data, determining which channels to use, and sending notifications.
-   **Factories (`ChannelFactory`, `NotificationFactory`)**: Implements the Factory and Strategy design patterns. These factories are responsible for providing the correct "channel" or "notification type" implementation at runtime, making the system highly extensible. To add a new channel (e.g., SMS), you only need to create a new channel class and register it in the factory.
-   **Repository Layer (`UINotificationRepository`)**: Abstracts database interactions, separating business logic from data access logic.
-   **External Services (`UserService`, `CompanyService`)**: These are mocked services that simulate fetching data from other microservices, as per the challenge requirements.


## Getting Started

### Prerequisites

-   [Docker](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation & Running the Project

1.  **Create an environment file:**
    Create a `.env` file in the root of the project and copy the contents of the provided `.env.example` (or create one with the content below).

    ```env
    # .env
    PORT=3000
    MONGODB_URI=mongodb://mongo:27017/notifications
    ```

2.  **Build and run the services using Docker Compose:**
    This single command will build the NestJS application image, pull the official MongoDB image, and start both containers in a shared network.

    ```sh
    docker compose up
    ```

The application will be running and available at `http://localhost:3000`.
To connect to database, we can use `mongosh` with command `mongosh "mongodb://127.0.0.1:27017/notification-db"`

---

## Running Tests

The core logic of the `NotificationService` and `TemplateService` is unit-tested. To run the tests, execute the following command in a separate terminal while the containers are running:

```sh
docker compose exec api pnpm test
```

This command runs the `test` script defined in `package.json` inside the running `app` container.

---

## API Endpoints

You can use a tool like Postman or `cURL` to interact with the API.

### 1. Send a Notification

This endpoint accepts a request to send a notification of a specific type to a user. The service will handle the logic of checking subscriptions and dispatching it to the correct channels.

-   **URL**: `/notifications/send`
-   **Method**: `POST`
-   **Headers**: `Content-Type: application/json`
-   **Body**:

    ```json
    {
      "userId": "user-1",
      "companyId": "company-a",
      "type": "happy-birthday"
    }
    ```

    -   `userId`: Can be `user-1` to `user-5`.
    -   `companyId`: Can be `company-a` or `company-b`.
    -   `type`: Can be `happy-birthday`, `monthly-payslip`, or `leave-balance-reminder`.

**Example cURL Request:**

```sh
curl --location 'http://localhost:3000/notifications/send' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "user-4",
    "companyId": "company-a",
    "type": "happy-birthday"
}'
```

This request will send a `happy-birthday` notification to User 4, who is subscribed to both `EMAIL` and `UI` channels. You will see the email log in your Docker terminal and a new entry in the database for the UI notification.

### 2. Get UI Notifications for a User

This endpoint retrieves a list of all UI notifications that have been stored for a specific user.

-   **URL**: `/notifications/ui/:userId`
-   **Method**: `GET`

**Example cURL Request:**

```sh
curl --location 'http://localhost:3000/notifications/ui/user-4'
```

**Example Success Response:**

```json
{
    "data": [
        {
            "_id": "63a2f8c6d1a6b2c2f4e4a7b7",
            "userId": "user-4",
            "content": "Happy 33th Birthday Alice! 🎉",
            "read": false,
            "createdAt": "2022-12-21T11:46:14.996Z",
            "updatedAt": "2022-12-21T11:46:14.996Z",
            "__v": 0
        }
    ],
    "count": 1
}
```