# React + TypeScript + Vite + Node.js API

This project combines a React frontend built with Vite and TypeScript with a Node.js/Express API server that handles SQLite database operations and file uploads.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Docker Setup

This application can be run using Docker with both the React frontend and Node.js backend in a single container, secured with SSL/TLS encryption.

### Quick Start with Docker Compose

```bash
# Build and run the application with SSL
docker compose up --build

# Run in detached mode
docker compose up -d --build
```

### Docker Permissions (if needed)

If you get permission errors with Docker, you may need to add your user to the docker group:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Then try the docker compose command again
docker compose up --build
```

The application will be available at `https://localhost:8443` (HTTPS)

**Note:** Your browser will show a security warning for the self-signed certificate - this is normal for development.

### Manual Docker Build

```bash
# Build the Docker image
docker build -t my-project-app .

# Run the container with SSL on port 8443
docker run -p 8443:443 -v $(pwd)/server/database:/app/server/database my-project-app
```

### SSL Certificate Generation

For local development, the Docker build automatically generates self-signed SSL certificates. If you need to generate them manually:

```bash
# Generate SSL certificates for development
./generate-ssl.sh
```

This creates:

- `ssl/server.key` - Private key
- `ssl/server.crt` - Self-signed certificate

### Development

For development, you can run the frontend and backend separately:

```bash
# Terminal 1: Generate SSL certificates and start the HTTPS API server
./generate-ssl.sh
cd server
node server.js

# Terminal 2: Start the React development server
npm run dev
```

The API server will run on `https://localhost:443` and the React dev server on `http://localhost:5173`

## API Endpoints

The Node.js server provides the following API endpoints:

- `POST /v1/api/upload` - Upload SQLite database files
- `POST /v1/api/query` - Query specific tables from uploaded databases
- `POST /v1/api/customQuery` - Execute custom SELECT queries
- `GET /v1/api/existingFiles` - List existing database files
- `GET /v1/api/status` - Check API server status

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
