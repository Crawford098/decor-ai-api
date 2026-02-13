# PostgreSQL Connection Setup Guide

## Installation

### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Database Setup

1. **Access PostgreSQL:**
```bash
psql -U postgres
```

2. **Run the schema:**
```bash
psql -U postgres -f src/database/schema.sql
```

Or manually:
```bash
psql -U postgres
\i src/database/schema.sql
```

## Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=decor_ai
DB_PORT=5432
```

## Testing Connection

```bash
npm run dev
```

You should see: `✅ PostgreSQL Database connected successfully`

## Useful PostgreSQL Commands

```sql
-- List databases
\l

-- Connect to database
\c decor_ai

-- List tables
\dt

-- Describe table
\d palettes

-- View table data
SELECT * FROM palettes;

-- Exit
\q
```
