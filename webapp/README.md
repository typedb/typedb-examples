# TypeSpace: Webapp Social Network Example

TypeSpace is an example project for a social network, demonstrating a React frontend connection directly to a TypeDB database with a rich schema. 
It is designed for experimentation, learning, and showcasing TypeDB as a backend.

The schema and data for this example can be found under `use-cases/social-network/schema.tql` and `use-cases/social-network/data.tql`.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Database:** TypeDB (with custom schema and sample data)

---

## Setup & Running

### 1. TypeDB

- Sign up for TypeDB Cloud at https://cloud.typedb.com
- Deploy a TypeDB Cloud instance, selecting the `social-network` sample dataset

OR

- Visit [our docs](https://typedb.com/docs/manual/install/CE) to learn how to install and run TypeDB Community Edition
- Follow the `use-cases/social-network` [README](../use-cases/social-network/README.md) to set up the schema and data

### 2. Frontend (React + Vite)
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

You may need to modify the config file to connect to your TypeDB instance.
It can be found at `src/config.tsx`, and contains the following properties:

| Property           | Type    | Description                                                              |
|--------------------|---------|--------------------------------------------------------------------------|
| TYPEDB_ADDRESS     | String  | The URL of your TypeDB instance.                                         |
| TYPEDB_USERNAME    | String  | The username for authentication.                                         |
| TYPEDB_PASSWORD    | String  | The password for authentication.                                         |
| TYPEDB_DATABASE    | String  | The name of the TypeDB database containing the `social-network` dataset. |

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

- This example can use the same TypeDB instance as the fullstack app example, and uses the same queries.
- You can run this alongside the fullstack app backends for development or comparison.
- If you want to explore or modify the schema or data, edit `schema.tql` and `data.tql` and reload the database.
- For advanced usage, you can interact directly with TypeDB using its console or client libraries.

For more details on API usage, data model, or backend implementation, see the documentation and source code in each backend directory.

---

## License
Apache 2.0
