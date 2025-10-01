# TypeSpace: Fullstack Social Network Example

TypeSpace is a fullstack example project for a social network, demonstrating a multi-language backend (Java, Rust, Python), a React frontend, and a TypeDB database with a rich schema. 
It is designed for experimentation, learning, and showcasing how different backend stacks can serve the same API and data model.

The schema and data for this example can be found under `use-cases/social-network/schema.tql` and `use-cases/social-network/data.tql`.

---

## Project Structure

```
fullstack/
├── backend/
│   ├── java/      # Spring Boot backend (Java)
│   ├── rust/      # Axum backend (Rust)
│   └── python/    # Flask backend (Python)
├── frontend/      # React + Vite frontend
use-cases/
├── social-network/
│   ├── schema.tql  # TypeDB schema
│   └── data.tql    # TypeDB data
```

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backends:**
  - Java (Spring Boot, TypeDB Java Driver)
  - Rust (Axum, TypeDB Rust Driver)
  - Python (Flask, Flask-CORS, TypeDB Python Driver)
- **Database:** TypeDB (with custom schema and sample data)

---

## Setup & Running

### 1. TypeDB

- Sign up for TypeDB Cloud at https://cloud.typedb.com
- Deploy a TypeDB Cloud instance, selecting the `social-network` sample dataset

OR

- Visit [our docs](https://typedb.com/docs/manual/install/CE) to learn how to install and run TypeDB Community Edition
- Follow the `use-cases/social-network` [README](../use-cases/social-network/README.md) to set up the schema and data

### 2. Backends

The API is accessible at `http://localhost:8080` in all backends.

You may need to modify the appropriate config file to connect to your TypeDB instance.
These can be found in:
- Java: `backend/java/src/main/java/com/example/backendjava/TypeDBConfig.java`
- Rust: `backend/rust/src/config.rs`
- Python: `backend/python/config.py`

Each contains the following properties:

| Property           | Type    | Description                                                              |
|--------------------|---------|--------------------------------------------------------------------------|
| TYPEDB_ADDRESS     | String  | The URL of your TypeDB instance.                                         |
| TYPEDB_USERNAME    | String  | The username for authentication.                                         |
| TYPEDB_PASSWORD    | String  | The password for authentication.                                         |
| TYPEDB_TLS_ENABLED | Boolean | Whether TLS is enabled.                                                  |
| TYPEDB_DATABASE    | String  | The name of the TypeDB database containing the `social-network` dataset. |

#### Java (Spring Boot)
- Requirements: Java 17+, Gradle
- Run:
  ```bash
  cd backend/java
  ./gradlew bootRun
  ```

#### Rust (Axum)
- Requirements: Rust toolchain
- Run:
  ```bash
  cd backend/rust
  cargo run
  ```

#### Python (Flask)
- Requirements: Python 3.9+, Flask
- Install dependencies:
  ```bash
  cd backend/python
  pip install -r requirements.txt
  ```
- Run:
  ```bash
  python app.py
  ```

### 3. Frontend (React + Vite)
- Requirements: Node.js, npm or pnpm
- Install dependencies:
  ```bash
  cd frontend
  npm install
  # or
  pnpm install
  ```
- Run in dev mode:
  ```bash
  npm run dev
  # or
  pnpm dev
  ```
- App available at: `http://localhost:5173` (default Vite port)

---

## API Overview

All backends (Java, Rust, Python) expose a similar REST API for interacting with the social network data. The endpoints are designed to be consistent across implementations, making it easy to switch between backends or run multiple at once.

### Common Endpoints

- `GET /api/pages`  
  Returns a list of all pages (people, organizations, groups) with basic info.

- `GET /api/user/:id`  
  Fetches detailed information about a user or page by their unique ID.

- `GET /api/posts?userId=...`  
  Retrieves posts for a given user or page.

- `GET /api/comments?postId=...`  
  Retrieves comments for a specific post.

- `POST /api/user`  
  Creates a new user (person).

- `POST /api/group`  
  Creates a new group.

- `POST /api/organization`  
  Creates a new organization.

- `POST /api/post`  
  Creates a new post.

- `POST /api/comment`  
  Adds a comment to a post.

- `GET /api/location/:placeId`  
  Returns information about a place and the pages located there.

---

## Database Schema

The schema models a comprehensive social network.

Core entities:
    - **Person:** Represents individual users with attributes like username, email, gender, and relationship status
    - **Content:** Abstract entity for all user-generated content (posts, comments)
    - **Page:** Abstract entity representing profile pages (person profiles, groups, organizations)
    - **Place:** Represents geographical locations (countries, states, cities, landmarks)
    - **Organization:** Represents companies, charities, and educational institutions

For more information, see [use-cases/social-network/README.md](../use-cases/social-network/README.md#schema-overview).

> [!NOTE]
> This example application utilizes only a subset of the full social network schema. Many entities, relationships, and attributes defined in the schema are not exercised by the backend or frontend code. The implementation focuses on the most relevant features for demonstration purposes.

---

## Notes

- All backends connect to the same TypeDB instance and use the same queries.
- You can run multiple backends at the same time (on different ports) for development or comparison.
- The frontend expects the backend API to be available at `http://localhost:8080` by default. If you run a backend on a different port, you may need to adjust the frontend's proxy settings or handle CORS accordingly.
- If you want to explore or modify the schema or data, edit `schema.tql` and `data.tql` and reload the database.
- For advanced usage, you can interact directly with TypeDB using its console or client libraries.

For more details on API usage, data model, or backend implementation, see the documentation and source code in each backend directory.

---

## License
Apache 2.0 
