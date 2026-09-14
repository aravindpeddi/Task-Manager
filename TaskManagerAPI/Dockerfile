# ==============================
# Build stage
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project file first
COPY ["TaskManagerAPI.csproj", "."]

# Restore dependencies
RUN dotnet restore "TaskManagerAPI.csproj"

# Copy the remaining source code
COPY . .

# Build and publish the application
RUN dotnet publish "TaskManagerAPI.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# ==============================
# Runtime stage
# ==============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Application will listen on port 8080
EXPOSE 8080

# Copy published application from build stage
COPY --from=build /app/publish .

# Start the API
ENTRYPOINT ["dotnet", "TaskManagerAPI.dll"]