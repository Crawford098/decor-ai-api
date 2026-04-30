# workdone Module - Technical Reference

## Overview

The Workdone module is the AI generation pipeline of Decor AI. It orchestrates the full flow from user input to a persisted, decorated-space image: it loads the requested design prompt and color palette, constructs a composite DALL-E 3 prompt, generates the image via OpenAI, uploads it to S3, and saves both a `WorksDone` record and an `Image` record to the database inside a single transaction. The response includes a short-lived presigned S3 URL ready for direct display.

## Architecture

### Module Dependencies

**Imported Modules:**
- `TypeOrmModule.forFeature([WorksDone, Image, Design, Palette])` — Provides repositories for all four entities
- `AuthModule` — Provides `JwtAuthGuard` and `@CurrentUser()` decorator
- `OpenAiModule` — Provides `OpenAiService` (DALL-E 3 image generation + download)
- `S3Module` — Provides `S3Service` (upload, presigned URL generation)

**Providers:**
- `WorkdoneService` — Core orchestration logic

**Controllers:**
- `WorkdoneController` — Single generation endpoint

---

## API Specification

### Base Route: `/workdone`

All endpoints require JWT authentication. Include the token as a Bearer header:

```
Authorization: Bearer <access_token>
```

---

### POST /workdone/generate

**Description:** Combines the selected design prompt, color palette, and a custom user prompt to generate an AI-decorated space image via DALL-E 3, upload it to S3, and persist the work record.

**Authentication:** Required — JWT Bearer token

**Request Specification:**

```http
POST /workdone/generate
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:** `GenerateWorkDoneDto`

```typescript
{
  designId:     number;   // Required. ID of the design whose prompt will be used
  paletteId:    number;   // Required. ID of the color palette to apply
  customPrompt: string;   // Required. Min length: 1. Additional generation instructions
}
```

**Example Request Body:**
```json
{
  "designId": 3,
  "paletteId": 7,
  "customPrompt": "Modern Scandinavian style with large windows and natural light"
}
```

**Success Response — 201 Created:**

```typescript
{
  workDone: {
    worldId:     number;  // Auto-generated primary key
    designId:    number;
    paletteId:   number;
    userId:      number;
    final_pront: string;  // Full composite prompt sent to DALL-E 3
    hidden:      number;  // Soft-delete flag (0 = visible)
  };
  image: {
    imageId:  number;  // Auto-generated primary key
    worldId:  number;  // FK → works_done.worldId
    path:     string;  // Presigned S3 read URL (short-lived)
    date:     string;  // ISO date string (YYYY-MM-DD)
    hidden:   number;  // Soft-delete flag (0 = visible)
  };
}
```

**Error Responses:**

| Status | Trigger |
|--------|---------|
| `400 Bad Request` | Validation error in request body (missing/invalid fields) |
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | `designId` or `paletteId` does not exist or is soft-deleted (`hidden ≠ 0`) |
| `500 Internal Server Error` | OpenAI API failure, S3 upload failure, or database transaction failure |

---

## DTOs

### `GenerateWorkDoneDto` (Request)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `designId` | `number` | Yes | `@IsNumber()` | ID of the design to use as the base prompt |
| `paletteId` | `number` | Yes | `@IsNumber()` | ID of the color palette to apply |
| `customPrompt` | `string` | Yes | `@IsString()`, `@MinLength(1)` | Additional user instructions for DALL-E 3 |

---

## Business Logic

### `WorkdoneService.generate(user, dto)`

Orchestrates the full AI generation pipeline in seven steps:

1. **Load & validate** — Fetches `Design` and `Palette` by their IDs, filtering out soft-deleted records (`hidden = 0`). Throws `NotFoundException` for either if not found.

2. **Build composite prompt** — Assembles the final DALL-E 3 prompt from three parts:
   - `Design.pronts` — the base design description
   - `Palette.colors` — the color palette string
   - `customPrompt` — the user's additional instructions

   ```
   "Design description: <design.pronts>. Color palette to apply: <palette.colors>. Additional instructions: <customPrompt>"
   ```
   Blank parts are omitted.

3. **Generate image** — Calls `OpenAiService.generateImage(finalPrompt)`, which returns a temporary OpenAI-hosted image URL.

4. **Download buffer** — Calls `OpenAiService.downloadImageAsBuffer(imageUrl)` to fetch the image as a `Buffer`.

5. **Upload to S3** — Builds a scoped S3 key via `S3Service.buildUserWorkdoneKey(userId, 'png')` and uploads the buffer with MIME type `image/png`.

6. **Persist in transaction** — Within a single `DataSource` transaction, saves:
   - A `WorksDone` row (design, palette, user, final prompt)
   - An `Image` row linked to the new `WorksDone` record via `worldId`
   
   If persistence fails the transaction is rolled back and a `500 InternalServerErrorException` is thrown.

7. **Presign & return** — Generates a presigned read URL for the stored S3 object and returns `{ workDone, image }` with `image.path` replaced by the presigned URL.

### Injected Dependencies

| Dependency | Source | Role |
|------------|--------|------|
| `Repository<Design>` | TypeORM | Load design by ID |
| `Repository<Palette>` | TypeORM | Load palette by ID |
| `OpenAiService` | `OpenAiModule` | Generate image URL, download buffer |
| `S3Service` | `S3Module` | Build key, upload buffer, generate presigned URL |
| `DataSource` | TypeORM | Run `WorksDone` + `Image` inserts in a single transaction |

---

## Authentication & Authorization

- **Guard:** `JwtAuthGuard` applied at controller class level — all endpoints require a valid JWT.
- **Current user:** `@CurrentUser()` decorator injects the `AuthenticatedUser` from the JWT payload.

```typescript
interface AuthenticatedUser {
  userId:   number;
  username: string;
  email:    string;
  profile:  Profile;
}
```

The `userId` is used to:
- Associate the `WorksDone` record with the authenticated user
- Namespace the S3 object key (`users/<userId>/workdone/<uuid>.png`)

---

## Entity Relationships

### `WorksDone` (table: `works_done`)

| Column | Type | Description |
|--------|------|-------------|
| `worldId` | `int` PK auto | Primary key |
| `designId` | `int` FK | References `designs.designId` |
| `paletteId` | `int` FK | References `palettes.paletteId` |
| `userId` | `int` FK | References `users.userId` |
| `final_pront` | `text` | Composite DALL-E 3 prompt |
| `hidden` | `smallint` | Soft-delete flag (0 = visible) |

Relationships:
- **ManyToOne → Design** (`designId`)
- **ManyToOne → Palette** (`paletteId`)
- **ManyToOne → User** (`userId`)
- **OneToMany → Image** (via `worldId`)

### `Image` (table: `images`)

| Column | Type | Description |
|--------|------|-------------|
| `imageId` | `int` PK auto | Primary key |
| `worldId` | `int` FK | References `works_done.worldId` |
| `path` | `varchar(255)` | S3 object key (stored); presigned URL (in responses) |
| `date` | `date` | Generation date |
| `hidden` | `smallint` | Soft-delete flag (0 = visible) |

Relationships:
- **ManyToOne → WorksDone** (`worldId`)

---

## External Integrations

### OpenAI (DALL-E 3)
- **Used by:** `OpenAiService`
- **Operations:** Image generation from text prompt, image buffer download
- **Required env var:** `OPENAI_API_KEY`

### AWS S3
- **Used by:** `S3Service`
- **Operations:** Buffer upload (`PutObject`), presigned read URL generation (`GetObject`)
- **S3 key pattern:** `users/<userId>/workdone/<uuid>.png`
- **Required env vars:** `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`

---

## Frontend Integration Notes

- `image.path` in the response is a **presigned URL** — it expires. Do not cache or store this URL permanently; re-fetch or re-generate if needed.
- The `final_pront` field on `workDone` contains the exact prompt sent to DALL-E 3 and can be displayed to users as a generation summary.
- Both `designId` and `paletteId` must reference non-hidden records; retrieve valid IDs from the `/designs` and `/palettes` endpoints first.
- `customPrompt` must be a non-empty string — send at least one character.
