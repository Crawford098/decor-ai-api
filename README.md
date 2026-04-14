# Decor AI API - NestJS

AI-powered interior decoration API built with NestJS and TypeORM.

## 🚀 Features

- **NestJS Framework**: Modern, scalable Node.js framework
- **TypeORM**: Full-featured ORM for TypeScript and JavaScript
- **PostgreSQL**: Robust database support
- **OpenAI Integration**: AI-powered design suggestions and image generation
- **Stripe Integration**: Payment processing
- **Swagger Documentation**: Auto-generated API documentation
- **Validation**: Class-validator for DTO validation
- **TypeScript**: Full type safety

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd decor-ai-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=decor_ai

OPENAI_API_KEY=your_openai_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Make sure your PostgreSQL database exists and has the required schema (existing migrations should already be in place).

## 🏃‍♂️ Running the Application

### Development mode:
```bash
npm run start:dev
```

### Production mode:
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs

## 🔌 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Profiles
- `GET /api/users/profiles/all` - Get all profiles
- `POST /api/users/profiles` - Create a new profile

### Palettes
- `GET /api/palettes` - Get all color palettes
- `GET /api/palettes/:id` - Get palette by ID
- `POST /api/palettes` - Create a new palette
- `PUT /api/palettes/:id` - Update a palette
- `POST /api/palettes/delete/:id` - Delete a palette

### Designs
- `GET /api/designs` - Get all designs
- `GET /api/designs/:id` - Get design by ID
- `POST /api/designs` - Create a new design
- `PUT /api/designs/:id` - Update a design
- `DELETE /api/designs/:id` - Delete a design

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get tag by ID
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag

### Payments
- `POST /api/payments/create-intent` - Create a payment intent
- `POST /api/payments/create-customer` - Create a customer
- `POST /api/payments/webhook` - Stripe webhook endpoint

## 🏗️ Project Structure

```
src/
├── entities/           # TypeORM entities
│   ├── profile.entity.ts
│   ├── user.entity.ts
│   ├── palette.entity.ts
│   ├── tag.entity.ts
│   ├── palette-tag.entity.ts
│   ├── design.entity.ts
│   ├── works-done.entity.ts
│   └── image.entity.ts
├── modules/            # Feature modules
│   ├── users/
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── palettes/
│   ├── designs/
│   ├── tags/
│   ├── payments/
│   └── openai/
├── config/             # Configuration files
│   └── typeorm.config.ts
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Database Migrations

The project uses TypeORM migrations for database schema management. Your existing database schema from Prisma migrations will continue to work.

If you need to create new migrations:

```bash
# Generate a migration
npm run typeorm migration:generate src/migrations/MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

## 🔧 Technologies Used

- **NestJS 10.x** - Progressive Node.js framework
- **TypeORM 0.3.x** - ORM for TypeScript
- **PostgreSQL** - Database
- **OpenAI API** - AI integration
- **Stripe API** - Payment processing
- **Swagger** - API documentation
- **Class-validator** - DTO validation
- **bcrypt** - Password hashing

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

