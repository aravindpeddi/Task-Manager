# Task Manager

A full-stack Task Manager application built for hands-on learning with
**React, JavaScript, CSS, ASP.NET Core, C#, Entity Framework Core, and
SQL Server LocalDB**.

The application lets you create daily tasks, edit them, mark them as
completed, reset individual tasks, delete tasks, delete all tasks, and
automatically reset completed tasks at midnight.

## Features

-   Create tasks with a title and description
-   View incomplete tasks separately from completed tasks
-   Mark a task as completed
-   Reset an individual completed task
-   Edit existing tasks
-   Delete an individual task
-   Delete all tasks
-   Manual **Reset All** functionality
-   Live countdown showing the time remaining until the next daily reset
-   Automatic daily task reset at midnight
-   Backend background service for the midnight reset
-   REST API built with ASP.NET Core
-   Entity Framework Core with SQL Server LocalDB
-   Swagger/OpenAPI for API testing during development
-   Frontend API URL configured through Vite environment variables

## Tech Stack

### Frontend

-   React 19
-   JavaScript
-   Vite
-   Axios
-   CSS

### Backend

-   C#
-   ASP.NET Core
-   .NET 8
-   Entity Framework Core 8
-   SQL Server / SQL Server LocalDB
-   Swagger / Swashbuckle

### Database

The project uses:

``` text
(localdb)\MSSQLLocalDB
```

with a database named:

``` text
TaskDB
```

Each developer uses their own local SQL Server LocalDB instance. Cloning
this repository does not connect another developer to the author's local
database.

## Project Structure

``` text
Task-Manager/
│
├── .gitignore
├── README.md
│
├── TaskManagerAPI/
│   ├── Controllers/
│   │   └── TaskController.cs
│   │
│   ├── Data/
│   │   └── TaskDbContext.cs
│   │
│   ├── Migrations/
│   │   ├── 20250328144431_InitialCreate.cs
│   │   ├── 20250328144431_InitialCreate.Designer.cs
│   │   └── TaskDbContextModelSnapshot.cs
│   │
│   ├── Models/
│   │   └── TaskItem.cs
│   │
│   ├── Properties/
│   │   └── launchSettings.json
│   │
│   ├── Services/
│   │   └── DailyResetService.cs
│   │
│   ├── Program.cs
│   ├── TaskManagerAPI.csproj
│   ├── TaskManagerAPI.sln
│   ├── appsettings.json
│   └── appsettings.Development.json
│
└── task-manager-frontend/
    ├── src/
    │   ├── components/
    │   │   └── TaskList.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    │
    ├── public/
    ├── .env.example
    ├── eslint.config.js
    ├── package.json
    ├── package-lock.json
    ├── task-manager-frontend.esproj
    └── vite.config.js
```

Generated folders such as `node_modules`, `bin`, `obj`, `.vs`, and
`dist` should not be committed to Git.

------------------------------------------------------------------------

# Prerequisites

Install the following before running the project.

## 1. Git

Install Git and verify:

``` powershell
git --version
```

## 2. .NET 8 SDK

Install the .NET 8 SDK.

Verify:

``` powershell
dotnet --version
```

The project targets:

``` text
net8.0
```

## 3. Node.js

Install Node.js.

Node.js 18+ is recommended; Node.js 20 LTS is a good choice.

Verify:

``` powershell
node --version
npm --version
```

## 4. SQL Server LocalDB

The project uses SQL Server LocalDB.

If you use Visual Studio, LocalDB is commonly installed with the SQL
Server Data Tools / database workload.

Verify that LocalDB is available:

``` powershell
sqllocaldb info
```

You should see:

``` text
MSSQLLocalDB
```

If necessary, start it:

``` powershell
sqllocaldb start MSSQLLocalDB
```

## 5. Entity Framework Core CLI

If `dotnet ef` is not available, install it:

``` powershell
dotnet tool install --global dotnet-ef
```

Verify:

``` powershell
dotnet ef --version
```

------------------------------------------------------------------------

# Clone the Repository

Clone the repository:

``` powershell
git clone https://github.com/aravindpeddi/Task-Manager.git
```

Move into the project:

``` powershell
cd Task-Manager
```

------------------------------------------------------------------------

# Backend Setup

Open a terminal in:

``` text
Task-Manager/TaskManagerAPI
```

or run:

``` powershell
cd TaskManagerAPI
```

Restore NuGet packages:

``` powershell
dotnet restore
```

Build the backend:

``` powershell
dotnet build
```

------------------------------------------------------------------------

# Database Setup

The project contains Entity Framework Core migrations.

Create/update the local database with:

``` powershell
dotnet ef database update
```

This creates/updates:

``` text
TaskDB
```

inside the developer's local:

``` text
(localdb)\MSSQLLocalDB
```

The connection string is configured in `appsettings.json` for local
development.

No remote/shared database is used by the default configuration.

------------------------------------------------------------------------

# Run the Backend

From:

``` text
Task-Manager/TaskManagerAPI
```

run:

``` powershell
dotnet run
```

The HTTP development endpoint is:

``` text
http://localhost:5143
```

Swagger is available at:

``` text
http://localhost:5143/swagger
```

The HTTPS profile can also use:

``` text
https://localhost:7018
```

depending on the selected .NET launch profile.

------------------------------------------------------------------------

# Frontend Setup

Open a second terminal.

Move to:

``` powershell
cd task-manager-frontend
```

Install npm dependencies:

``` powershell
npm install
```

------------------------------------------------------------------------

# Environment Configuration

The frontend uses Vite environment variables for the backend API URL.

The repository should contain:

``` text
task-manager-frontend/.env.example
```

with:

``` env
VITE_API_URL=http://localhost:5143/api
```

Create your local environment file by copying the example:

``` powershell
Copy-Item .env.example .env
```

Your local `.env` should contain:

``` env
VITE_API_URL=http://localhost:5143/api
```

### Important

`.env` is intentionally ignored by Git.

`.env.example` is safe to commit because it contains configuration only
and no secret.

After creating or changing `.env`, restart the Vite development server.

------------------------------------------------------------------------

# Run the Frontend

From:

``` text
Task-Manager/task-manager-frontend
```

run:

``` powershell
npm run dev
```

The Vite configuration uses port:

``` text
58173
```

Open:

``` text
http://localhost:58173
```

------------------------------------------------------------------------

# Running the Complete Application

You need two terminals.

## Terminal 1 --- Backend

``` powershell
cd TaskManagerAPI
dotnet run
```

Backend:

``` text
http://localhost:5143
```

Swagger:

``` text
http://localhost:5143/swagger
```

## Terminal 2 --- Frontend

``` powershell
cd task-manager-frontend
npm install
npm run dev
```

Frontend:

``` text
http://localhost:58173
```

------------------------------------------------------------------------

# Application Flow

The application follows this architecture:

``` text
React Frontend
      │
      │ Axios / HTTP
      ▼
ASP.NET Core Web API
      │
      │ Entity Framework Core
      ▼
SQL Server LocalDB
      │
      ▼
TaskDB
```

The frontend does not directly access SQL Server.

------------------------------------------------------------------------

# API Endpoints

The main API controller is:

``` text
TaskManagerAPI/Controllers/TaskController.cs
```

Base URL:

``` text
http://localhost:5143/api/task
```

## Get all tasks

``` http
GET /api/task
```

Returns all tasks.

## Create a task

``` http
POST /api/task
```

Example request:

``` json
{
  "title": "Study Docker",
  "description": "Learn Docker fundamentals",
  "isCompleted": false
}
```

## Update a task

``` http
PUT /api/task/{id}
```

Used for editing a task and changing its completion state.

## Reset all completed tasks

``` http
PUT /api/task/reset-all
```

This changes completed tasks back to:

``` text
IsCompleted = false
```

This endpoint is used by the frontend for the daily reset.

## Delete a task

``` http
DELETE /api/task/{id}
```

## Swagger

During development:

``` text
http://localhost:5143/swagger
```

Swagger can be used to manually test the API.

------------------------------------------------------------------------

# Daily Reset Behaviour

The application has two layers involved in the daily reset.

## Frontend countdown

The React application calculates the next local midnight and displays:

``` text
Time remaining to reset tasks: 02h 20m 54s
```

The countdown is calculated from the current time rather than relying
only on decrementing a counter.

At midnight, the frontend calls:

``` http
PUT /api/task/reset-all
```

and then reloads the task list.

## Backend background service

The backend contains:

``` text
TaskManagerAPI/Services/DailyResetService.cs
```

This is an ASP.NET Core `BackgroundService`.

It calculates the next midnight, waits until that time, and resets
completed tasks in the database.

This means the backend can perform the reset even if the frontend page
is not open, as long as the backend process is running.

------------------------------------------------------------------------

# Task Status

Tasks have an `IsCompleted` property.

Example:

``` json
{
  "id": 1,
  "title": "Study",
  "description": "Study for one hour",
  "isCompleted": false
}
```

The frontend separates tasks into:

``` text
Tasks yet to Complete
```

and:

``` text
Completed Tasks
```

At the daily reset, completed tasks become incomplete again.

------------------------------------------------------------------------

# Database and Migrations

Entity Framework Core is used for database access.

The DbContext is:

``` text
TaskManagerAPI/Data/TaskDbContext.cs
```

The entity is:

``` text
TaskManagerAPI/Models/TaskItem.cs
```

Migrations are stored in:

``` text
TaskManagerAPI/Migrations/
```

To apply existing migrations:

``` powershell
dotnet ef database update
```

To create a new migration after changing the database model:

``` powershell
dotnet ef migrations add YourMigrationName
```

Then apply it:

``` powershell
dotnet ef database update
```

Do not manually edit existing migration files unless you understand the
consequences.

------------------------------------------------------------------------

# Development Commands

## Backend

Restore:

``` powershell
dotnet restore
```

Build:

``` powershell
dotnet build
```

Run:

``` powershell
dotnet run
```

Update database:

``` powershell
dotnet ef database update
```

## Frontend

Install dependencies:

``` powershell
npm install
```

Run development server:

``` powershell
npm run dev
```

Run lint:

``` powershell
npm run lint
```

Build production frontend:

``` powershell
npm run build
```

Preview production build:

``` powershell
npm run preview
```

------------------------------------------------------------------------

# Security Notes

This project is currently intended as a learning/local-development
project.

Authentication and authorization are intentionally not implemented yet.

Before exposing the API publicly, additional security work should be
done, including:

-   Authentication
-   Authorization
-   Restricting CORS to trusted frontend origins
-   Rate limiting
-   Stronger API validation
-   DTOs for controlled updates
-   HTTPS configuration
-   Production secret management
-   Production database security
-   Logging and monitoring

The current default database configuration uses SQL Server LocalDB on
the developer's own machine.

Do not put production database passwords, API keys, tokens, or other
secrets into the repository.

------------------------------------------------------------------------

# Git and Environment Files

The project uses a root `.gitignore`.

The following should not be committed:

``` text
.vs/
.vscode/
.idea/
bin/
obj/
node_modules/
dist/
.env
*.user
*.suo
*.log
```

The following can be committed:

``` text
.env.example
package.json
package-lock.json
TaskManagerAPI.csproj
TaskManagerAPI.sln
Migrations/
source code
README.md
```

------------------------------------------------------------------------

# Before Pushing to GitHub

Run the following checks from the repository root.

## 1. Check Git status

``` powershell
git status
```

Make sure generated folders such as:

``` text
.vs/
bin/
obj/
node_modules/
dist/
```

are not appearing as files to commit.

## 2. Check ignored files

``` powershell
git status --ignored
```

Generated files should appear under ignored files.

## 3. Check for accidentally tracked generated files

If `.vs`, `bin`, or `obj` were tracked previously, remove them from
Git's index:

``` powershell
git rm -r --cached .vs
git rm -r --cached TaskManagerAPI/.vs
git rm -r --cached TaskManagerAPI/bin
git rm -r --cached TaskManagerAPI/obj
```

If `node_modules` was ever tracked:

``` powershell
git rm -r --cached task-manager-frontend/node_modules
```

If the user-specific project file is tracked:

``` powershell
git rm --cached TaskManagerAPI/TaskManagerAPI.csproj.user
```

It is okay if Git reports that a path was not tracked.

## 4. Search for secrets

From the repository root:

``` powershell
git grep -n -i -E "password|apikey|api_key|secret|token"
```

Review every result before pushing.

Do not push real:

``` text
API keys
Passwords
Access tokens
Private keys
Production connection strings
Client secrets
```

## 5. Build the backend

``` powershell
cd TaskManagerAPI
dotnet restore
dotnet build
dotnet ef database update
```

## 6. Check the frontend

``` powershell
cd ..\task-manager-frontend
npm install
npm run lint
npm run build
```

## 7. Check the frontend API configuration

Search the frontend source for:

``` text
localhost:5143
```

The API URL should preferably come from:

``` javascript
import.meta.env.VITE_API_URL
```

rather than being hardcoded throughout the application.

## 8. Stage changes

From the repository root:

``` powershell
cd ..
git add .
```

## 9. Inspect staged files

``` powershell
git status
```

Make sure you are committing source/configuration files and not:

``` text
.vs/
bin/
obj/
node_modules/
dist/
.env
*.user
```

## 10. Review the actual staged diff

``` powershell
git diff --cached
```

This is the final opportunity to catch an accidental secret or unwanted
file.

## 11. Commit

Example:

``` powershell
git commit -m "Fix daily task reset and project configuration"
```

## 12. Push

``` powershell
git push origin main
```

------------------------------------------------------------------------

# Troubleshooting

## Frontend cannot connect to backend

Check that the backend is running:

``` text
http://localhost:5143
```

Check:

``` text
task-manager-frontend/.env
```

contains:

``` env
VITE_API_URL=http://localhost:5143/api
```

Then restart Vite:

``` powershell
npm run dev
```

## Database does not exist

Run:

``` powershell
cd TaskManagerAPI
dotnet ef database update
```

## `dotnet ef` is not recognized

Install the EF CLI:

``` powershell
dotnet tool install --global dotnet-ef
```

Then verify:

``` powershell
dotnet ef --version
```

## Frontend build fails

Run:

``` powershell
cd task-manager-frontend
npm install
npm run lint
npm run build
```

If dependencies are corrupted, remove `node_modules` and reinstall:

``` powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## LocalDB is not available

Check:

``` powershell
sqllocaldb info
```

Start it if necessary:

``` powershell
sqllocaldb start MSSQLLocalDB
```

------------------------------------------------------------------------

# Learning Goals

This project is intended to provide hands-on experience with:

-   React components
-   React state and hooks
-   `useEffect`
-   `useCallback`
-   `useMemo`
-   Axios
-   REST APIs
-   HTTP methods
-   ASP.NET Core controllers
-   C# asynchronous programming
-   Entity Framework Core
-   SQL Server LocalDB
-   EF Core migrations
-   Background services
-   CORS
-   Swagger
-   Environment variables
-   Git and GitHub
-   Basic application security

------------------------------------------------------------------------

# Future Improvements

Possible future improvements include:

-   User authentication
-   User-specific tasks
-   Authorization
-   Task categories
-   Task priorities
-   Due dates
-   Search and filtering
-   Sorting
-   Drag-and-drop task ordering
-   Unit tests
-   Integration tests
-   API rate limiting
-   DTO-based API contracts
-   Better server-side validation
-   Docker support
-   CI/CD pipeline
-   Cloud deployment

------------------------------------------------------------------------

# Author

**Aravind Reddy**

GitHub:

https://github.com/aravindpeddi

Repository:

https://github.com/aravindpeddi/Task-Manager

------------------------------------------------------------------------

# License

This project is currently a personal learning project.

Add an explicit open-source license if you intend to define permissions
for other people to reuse, modify, or distribute the code.
