#!/usr/bin/env bash
set -e

# Realtor Platform - Unified Setup & Orchestration Script
echo "========================================================"
echo "🏡 Initializing Realtor Full-Stack Docker Solution"
echo "========================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Verify Docker Availability
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    echo "Please install Docker and Docker Compose before running setup."
    exit 1
fi

DOCKER_CMD="docker"
if ! docker ps &> /dev/null; then
    if sg docker -c "docker ps" &> /dev/null; then
        DOCKER_CMD="sg docker -c"
    else
        echo "⚠️ Warning: Current user may need sudo or group permissions to access Docker socket."
    fi
fi

# 2. Configure Environment Files
echo ""
echo "⚙️  Configuring environment files..."

if [ ! -f "realtor/.env" ]; then
    echo "Creating realtor/.env..."
    cat <<EOF > realtor/.env
PORT=4000
MONGO_URI=mongodb://mongo:27017/realtor
NODE_ENV=development
EOF
fi

if [ ! -f "realtor-ui/.env" ]; then
    echo "Creating realtor-ui/.env..."
    cat <<EOF > realtor-ui/.env
EXPO_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA9edVAq_sH2WYqwQeGBJw3vp58X7tAUQg
NODE_ENV=development
EOF
fi

echo "✅ Environment files configured."

# 3. Build & Launch Docker Containers
echo ""
echo "🚀 Building and starting containerized services..."
$DOCKER_CMD "docker compose up -d --build"

# 4. Await Service Readiness
echo ""
echo "⏳ Waiting for services to become healthy and online..."

# Await MongoDB
echo -n "   - Checking MongoDB (port 27017)... "
RETRIES=30
until $DOCKER_CMD "docker compose exec -T mongo mongosh --eval \"db.adminCommand('ping')\"" &> /dev/null || [ $RETRIES -eq 0 ]; do
    sleep 1
    RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
    echo "⚠️ Timed out waiting for MongoDB container."
else
    echo "✅ Ready."
fi

# Await Backend Health Endpoint
echo -n "   - Checking Backend API (http://localhost:4000/health)... "
RETRIES=30
until curl -s -f http://localhost:4000/health &> /dev/null || [ $RETRIES -eq 0 ]; do
    sleep 1
    RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
    echo "⚠️ Timed out waiting for Backend API."
else
    echo "✅ Ready."
fi

# Await Mongo Express Admin Interface
echo -n "   - Checking Mongo Express (http://localhost:8081)... "
RETRIES=30
until curl -s -f -I http://localhost:8081 &> /dev/null || [ $RETRIES -eq 0 ]; do
    sleep 1
    RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
    echo "⚠️ Timed out waiting for Mongo Express."
else
    echo "✅ Ready."
fi

# Await Frontend Interface
echo -n "   - Checking Frontend Web App (http://localhost:8080)... "
RETRIES=30
until curl -s -f -I http://localhost:8080 &> /dev/null || [ $RETRIES -eq 0 ]; do
    sleep 1
    RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
    echo "⚠️ Timed out waiting for Frontend."
else
    echo "✅ Ready."
fi

# 5. Execute / Verify Database Seeding
echo ""
echo "🌱 Verifying Database Seeding..."
$DOCKER_CMD "docker compose exec -T realtor npm run seed" || true

# 6. Display Completion Summary
echo ""
echo "========================================================"
echo "🎉 Realtor Solution is Ready for Use!"
echo "========================================================"
echo ""
echo "📱 Application Services:"
echo "   • Frontend Web App:       http://localhost:8080"
echo "   • GraphQL API Endpoint:   http://localhost:4000/graphql"
echo "   • Health Check Endpoint:  http://localhost:4000/health"
echo "   • Mongo Express Admin:    http://localhost:8081"
echo "   • MongoDB Database:       mongodb://localhost:27017/realtor"
echo ""
echo "🔑 Pre-Seeded Accounts:"
echo "   • Admin: admin@realtor.com / admin  (Role: admin)"
echo "   • User:  user@realtor.com  / user   (Role: user)"
echo ""
echo "🛠  Useful Commands:"
echo "   • View Logs:  npm run logs     (or docker compose logs -f)"
echo "   • Stop App:   npm run stop     (or docker compose down)"
echo "   • Start App:  npm run start    (or docker compose up -d)"
echo "   • Re-seed DB: npm run seed     (or docker compose exec realtor npm run seed)"
echo "========================================================"
