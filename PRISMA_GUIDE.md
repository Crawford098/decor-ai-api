# Prisma Integration Guide

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure DATABASE_URL in .env:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/decor_ai?schema=public"
```

3. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

4. **Push schema to database:**
```bash
npm run prisma:push
```

5. **Seed the database:**
```bash
npm run prisma:seed
```

## Available Prisma Scripts

```bash
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Create and apply migrations
npm run prisma:push        # Push schema to database (no migration)
npm run prisma:studio      # Open Prisma Studio (GUI)
npm run prisma:seed        # Seed database with sample data
```

## Prisma Studio

Prisma Studio is a visual database browser. Launch it with:
```bash
npm run prisma:studio
```

Then open: http://localhost:5555

## Database Models

### Palette
- `id`: Auto-increment integer
- `name`: String
- `colors`: JSON array of color hex codes
- `designs`: Relation to Design[]
- `createdAt`, `updatedAt`: Timestamps

### Design
- `id`: Auto-increment integer
- `title`: String (required)
- `description`: Text (optional)
- `roomType`: String (optional)
- `style`: String (optional)
- `paletteId`: Foreign key to Palette
- `palette`: Relation to Palette
- `imageUrl`: Text (optional)
- `aiPrompt`: Text (optional)
- `createdAt`, `updatedAt`: Timestamps

## Usage Examples

### Query designs with palette:
```typescript
const designs = await prisma.design.findMany({
  include: {
    palette: true
  }
});
```

### Create a new palette:
```typescript
const palette = await prisma.palette.create({
  data: {
    name: 'Vibrant',
    colors: ['#FF0000', '#00FF00', '#0000FF']
  }
});
```

### Update a design:
```typescript
const design = await prisma.design.update({
  where: { id: 1 },
  data: { title: 'Updated Title' }
});
```

## Migration Workflow

For production, use migrations instead of `db push`:

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy
```
