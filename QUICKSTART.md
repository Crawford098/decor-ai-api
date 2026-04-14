# Decor AI API - Quick Start Guide

## ✅ Migration Complete!

Your Express.js project has been successfully migrated to **NestJS 10.x** with **TypeORM**.

## 🚀 Quick Start

1. **Verify your .env file** (already exists):
   ```bash
   cat .env
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start the development server**:
   ```bash
   npm run start:dev
   ```

4. **Access the API**:
   - API Base: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api/docs

## 📦 What's New

### Architecture
- ✅ **NestJS Framework** - Modern, modular architecture
- ✅ **TypeORM** - Replaces Prisma (NestJS recommended ORM)
- ✅ **Swagger UI** - Interactive API documentation
- ✅ **Class Validation** - Automatic request validation

### Project Structure
```
src/
├── main.ts              # Application entry point
├── app.module.ts        # Root module
├── config/              # Configuration files
│   └── data-source.ts   # TypeORM data source config
├── entities/            # Database entities (TypeORM)
│   ├── user.entity.ts
│   ├── profile.entity.ts
│   ├── palette.entity.ts
│   ├── tag.entity.ts
│   ├── palette-tag.entity.ts
│   ├── design.entity.ts
│   ├── works-done.entity.ts
│   └── image.entity.ts
└── modules/             # Feature modules
    ├── users/          # Users module
    ├── palettes/       # Palettes module
    ├── designs/        # Designs module
    ├── tags/           # Tags module
    ├── payments/       # Stripe payments
    └── openai/         # OpenAI integration
```

## 🎯 Available Commands

```bash
# Development
npm run start:dev        # Start in watch mode

# Production
npm run build           # Build for production
npm run start:prod      # Start production server

# Testing
npm run test           # Run tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage

# Format & Lint
npm run format         # Format code with Prettier
npm run lint           # Lint with ESLint
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`:

### Users & Profiles
- `GET    /api/users` - Get all users
- `GET    /api/users/:id` - Get user by ID
- `POST   /api/users` - Create user
- `PUT    /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET    /api/users/profiles/all` - Get all profiles
- `POST   /api/users/profiles` - Create profile

### Palettes
- `GET    /api/palettes` - Get all palettes
- `GET    /api/palettes/:id` - Get palette by ID
- `POST   /api/palettes` - Create palette
- `PUT    /api/palettes/:id` - Update palette
- `POST   /api/palettes/delete/:id` - Delete palette

### Designs
- `GET    /api/designs` - Get all designs
- `GET    /api/designs/:id` - Get design by ID
- `POST   /api/designs` - Create design
- `PUT    /api/designs/:id` - Update design
- `DELETE /api/designs/:id` - Delete design

### Tags
- `GET    /api/tags` - Get all tags
- `GET    /api/tags/:id` - Get tag by ID
- `POST   /api/tags` - Create tag
- `PUT    /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Payments (Stripe)
- `POST   /api/payments/create-intent` - Create payment intent
- `POST   /api/payments/create-customer` - Create customer
- `POST   /api/payments/webhook` - Stripe webhook

## 📝 Environment Variables

Your existing `.env` file works without changes:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=decor_ai

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🗄️ Database

Your PostgreSQL database and data remain unchanged. The existing schema continues to work.

### TypeORM Migrations (Optional)

If you need to create new migrations in the future:

```bash
# Generate migration
npm run migration:generate src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3000/api/docs (when server is running)
- **Migration Summary**: See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

## ✨ Key Benefits

1. **Modular Architecture** - Better code organization
2. **Type Safety** - Full TypeScript support
3. **Auto Documentation** - Swagger UI
4. **Dependency Injection** - Better testability
5. **Validation** - Automatic DTO validation
6. **Scalability** - Enterprise-ready structure

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection issues
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists

### Build errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📖 Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger Documentation](https://swagger.io)

---

**Ready to start?** Run `npm run start:dev` and visit http://localhost:3000/api/docs 🚀
