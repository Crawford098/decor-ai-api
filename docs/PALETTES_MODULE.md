# Palettes Module - Technical Reference

## Overview

The Palettes module manages color palette resources in the Decor AI system. It provides CRUD operations for palette entities, supporting soft deletion patterns and user-specific palette management. Palettes represent collections of colors that can be applied to interior design concepts, associated with tags for categorization, and tracked through completed work records.

## Architecture

### Module Dependencies

**Imported Modules:**
- `TypeOrmModule.forFeature([Palette])` - Provides Palette entity repository
- `AuthModule` - Provides authentication guards (JWT) and strategies

**Providers:**
- `PalettesService` - Business logic for palette operations

**Controllers:**
- `PalettesController` - HTTP endpoints for palette management

**Exports:**
- `PalettesService` - Available for injection in other modules

### Database Schema

**Primary Entity:** `Palette`
**Table Name:** `palettes`

Relationships:
- **ManyToOne → User**: Each palette can optionally belong to one user (nullable)
- **OneToMany → WorksDone**: A palette can be applied to multiple completed work records
- **OneToMany → PaletteTag**: A palette can have multiple tags through the PaletteTag join table

## API Specification

### Base Route: `/palettes`

All endpoints require JWT authentication (`@UseGuards(JwtAuthGuard)`) and must include an Authorization header with a valid Bearer token.

---

### Endpoint: GET /palettes

**Description:** Retrieve all non-hidden color palettes across all users

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// No parameters required

// Headers
Authorization: Bearer <jwt_token>
```

**Response Specification:**
```typescript
// Success Response (200)
interface PaletteListResponse extends Array<PaletteWithRelations> {
  // Array of palette objects
}

interface PaletteWithRelations {
  paletteId: number;
  userId: number | null;
  name: string;
  colors: string;              // JSON string array of colors
  created_by: string;          // Creator identifier (UPPERCASE)
  createdDate: Date;           // ISO 8601 timestamp
  hidden: number;              // 0 = visible, 1 = soft-deleted
  paletteTags: PaletteTag[];   // Associated tags
}

interface PaletteTag {
  paletteTagId: number;
  tagId: number;
  paletteId: number;
  createdDate: Date;
  hidden: number;
  tag: {
    tagId: number;
    name: string;
    // ... other tag fields
  };
}
```

**Error Responses:**
```typescript
// 401 Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}
```

**Business Rules:**
- Only returns palettes where `hidden = 0`
- Includes related palette tags and tag information via join
- Results ordered by `paletteId` in descending order (newest first)
- No pagination implemented - returns all matching records
- `colors` field contains JSON string that should be parsed client-side

**Colors Format:**
```typescript
// The colors field is a JSON string containing an array of color codes
// Example value: '["#FF5733", "#33FF57", "#3357FF"]'
// Frontend should parse: JSON.parse(palette.colors)
```

**State Changes:**
- None - Read-only operation

---

### Endpoint: GET /palettes/:id

**Description:** Retrieve a single color palette by ID

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Palette ID (converted to number internally)
}

// Headers
Authorization: Bearer <jwt_token>
```

**Response Specification:**
```typescript
// Success Response (200)
interface PaletteDetailResponse {
  paletteId: number;
  userId: number | null;
  name: string;
  colors: string;              // JSON string array
  created_by: string;
  createdDate: Date;
  hidden: number;
  paletteTags: PaletteTag[];
}
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Palette with ID {id} not found",
  error: "Not Found"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}
```

**Business Rules:**
- Only returns palette if `hidden = 0`
- Includes related palette tags and tag information
- Path parameter automatically converted from string to number
- Throws NotFoundException if palette not found or is soft-deleted

**State Changes:**
- None - Read-only operation

---

### Endpoint: POST /palettes

**Description:** Create a new color palette

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Request Body
interface CreatePaletteDto {
  userId?: number;        // Optional - User ID who owns the palette
  name: string;           // Required - Palette name
  colors: string;         // Required - JSON string of colors array
  created_by?: string;    // Optional - Creator identifier (will be uppercased)
}

// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Validation Rules:**
```typescript
{
  userId: {
    type: 'number',
    optional: true
  },
  name: {
    type: 'string',
    required: true,
    validation: '@IsString()'
  },
  colors: {
    type: 'string',
    required: true,
    validation: '@IsString()',
    description: 'Must be a valid JSON string array'
  },
  created_by: {
    type: 'string',
    optional: true,
    validation: '@IsString()'
  }
}
```

**JSON Example:**
```json
{
  "userId": 123,
  "name": "Modern Neutrals",
  "colors": "[\"#F5F5F5\", \"#E0E0E0\", \"#BDBDBD\", \"#9E9E9E\", \"#757575\"]",
  "created_by": "admin"
}
```

**Response Specification:**
```typescript
// Success Response (201)
interface CreatePaletteResponse {
  paletteId: number;        // Auto-generated
  userId: number | null;
  name: string;
  colors: string;
  created_by: string;       // Converted to UPPERCASE
  createdDate: Date;        // Auto-generated timestamp
  hidden: number;           // Default: 0
}
```

**Error Responses:**
```typescript
// 400 Bad Request - Validation Error
{
  statusCode: 400,
  message: [
    "name should not be empty",
    "name must be a string",
    "colors should not be empty",
    "colors must be a string"
  ],
  error: "Bad Request"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}
```

**Business Rules:**
- `created_by` automatically converted to uppercase before saving
- If `created_by` not provided, defaults to 'SYSTEM'
- `createdDate` automatically set to current timestamp
- `hidden` defaults to 0 (visible)
- `colors` must be a valid JSON string (validation should be done client-side)
- `userId` is optional and can be null for system palettes

**State Changes:**
- Creates a new palette record in database
- Returns complete created palette object

---

### Endpoint: PUT /palettes/:id

**Description:** Update an existing color palette

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Palette ID to update
}

// Request Body
interface UpdatePaletteDto {
  name?: string;          // Optional - New palette name
  colors?: string;        // Optional - New JSON string of colors
  hidden?: number;        // Optional - Soft delete flag (0 or 1)
}

// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Validation Rules:**
```typescript
{
  name: {
    type: 'string',
    optional: true,
    validation: '@IsString()'
  },
  colors: {
    type: 'string',
    optional: true,
    validation: '@IsString()'
  },
  hidden: {
    type: 'number',
    optional: true,
    validation: '@IsNumber()'
  }
}
```

**JSON Example:**
```json
{
  "name": "Modern Neutrals - Updated",
  "colors": "[\"#FFFFFF\", \"#F0F0F0\", \"#E0E0E0\"]"
}
```

**Response Specification:**
```typescript
// Success Response (200)
interface UpdatePaletteResponse {
  paletteId: number;
  userId: number | null;
  name: string;             // Updated or original value
  colors: string;           // Updated or original value
  created_by: string;
  createdDate: Date;
  hidden: number;           // Updated or original value
}
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Palette with ID {id} not found",
  error: "Not Found"
}

// 400 Bad Request - Validation Error
{
  statusCode: 400,
  message: [
    "name must be a string",
    "colors must be a string",
    "hidden must be a number"
  ],
  error: "Bad Request"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}
```

**Business Rules:**
- Only fields provided in request body are updated
- Palette must exist and not be soft-deleted (`hidden = 0`)
- All fields are optional - can update partial data
- Cannot update `paletteId`, `userId`, `created_by`, or `createdDate`
- Returns updated palette object after save

**State Changes:**
- Updates palette record in database
- Modified fields are persisted
- Returns complete updated palette object

---

### Endpoint: POST /palettes/delete/:id

**Description:** Soft delete a color palette (sets hidden flag to 1)

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Palette ID to delete
}

// Headers
Authorization: Bearer <jwt_token>
```

**Response Specification:**
```typescript
// Success Response (204 No Content)
// Empty response body
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Palette with ID {id} not found",
  error: "Not Found"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}
```

**Business Rules:**
- Uses POST method (not DELETE) for soft deletion
- Palette must exist and not already be soft-deleted
- Sets `hidden` field to 1 instead of physically deleting record
- Returns HTTP 204 (No Content) on success
- Palette will no longer appear in GET /palettes or GET /palettes/:id results

**State Changes:**
- Updates palette `hidden` field from 0 to 1
- Palette remains in database but excluded from queries
- Related records (PaletteTags, WorksDone) are not affected

---

## Data Transfer Objects (DTOs)

### CreatePaletteDto

**Purpose:** Validate and structure data for creating new palettes

**TypeScript Definition:**
```typescript
class CreatePaletteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'JSON string of colors array' })
  @IsString()
  colors: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  created_by?: string;
}
```

**Field Specifications:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `userId` | number | No | @IsNumber() | User ID who owns the palette |
| `name` | string | Yes | @IsString() | Name of the color palette |
| `colors` | string | Yes | @IsString() | JSON string containing array of color codes |
| `created_by` | string | No | @IsString() | Creator identifier (converted to uppercase) |

**Usage Example:**
```typescript
const createDto: CreatePaletteDto = {
  userId: 42,
  name: "Coastal Blues",
  colors: JSON.stringify(["#0077BE", "#00A8E8", "#00C9FF", "#7DD3FC"]),
  created_by: "designer_01"
};
```

### UpdatePaletteDto

**Purpose:** Validate and structure data for updating existing palettes

**TypeScript Definition:**
```typescript
class UpdatePaletteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colors?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hidden?: number;
}
```

**Field Specifications:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | No | @IsString() | New name for the palette |
| `colors` | string | No | @IsString() | New JSON string of colors |
| `hidden` | number | No | @IsNumber() | Soft delete flag (0 or 1) |

**Usage Example:**
```typescript
const updateDto: UpdatePaletteDto = {
  name: "Coastal Blues - Summer Edition",
  colors: JSON.stringify(["#0088CC", "#33BBFF", "#66DDFF"])
};
```

---

## Business Logic (Service Layer)

### PalettesService Methods

#### findAll()
```typescript
async findAll(): Promise<Palette[]>
```
**Purpose:** Retrieve all visible palettes with related tags

**Operations:**
1. Query palette repository with conditions
2. Filter by `hidden = 0`
3. Include relations: `paletteTags` and `paletteTags.tag`
4. Order by `paletteId DESC` (newest first)

**Return:** Array of Palette objects with nested tag relationships

**Dependencies:** Palette repository

---

#### findOne(id: number)
```typescript
async findOne(id: number): Promise<Palette>
```
**Purpose:** Retrieve a single palette by ID with related tags

**Operations:**
1. Query palette repository for specific ID
2. Filter by `hidden = 0`
3. Include relations: `paletteTags` and `paletteTags.tag`
4. Throw NotFoundException if not found

**Parameters:**
- `id` (number): Palette ID to retrieve

**Return:** Single Palette object with nested tag relationships

**Throws:** `NotFoundException` if palette not found or soft-deleted

**Dependencies:** Palette repository

---

#### create(createPaletteDto: CreatePaletteDto)
```typescript
async create(createPaletteDto: CreatePaletteDto): Promise<Palette>
```
**Purpose:** Create a new color palette

**Operations:**
1. Create palette entity from DTO
2. Convert `created_by` to uppercase (default: 'SYSTEM' if not provided)
3. Set `createdDate` to current timestamp
4. Save to database

**Parameters:**
- `createPaletteDto` (CreatePaletteDto): Palette creation data

**Return:** Newly created Palette object

**Side Effects:**
- Inserts new record into palettes table
- Auto-generates paletteId

**Dependencies:** Palette repository

---

#### update(id: number, updatePaletteDto: UpdatePaletteDto)
```typescript
async update(id: number, updatePaletteDto: UpdatePaletteDto): Promise<Palette>
```
**Purpose:** Update an existing palette

**Operations:**
1. Find palette by ID (throws if not found)
2. Merge update data into palette entity
3. Save updated palette to database

**Parameters:**
- `id` (number): Palette ID to update
- `updatePaletteDto` (UpdatePaletteDto): Fields to update

**Return:** Updated Palette object

**Throws:** `NotFoundException` if palette not found

**Side Effects:**
- Updates palette record in database

**Dependencies:** Palette repository, findOne method

---

#### remove(id: number)
```typescript
async remove(id: number): Promise<void>
```
**Purpose:** Soft delete a palette by setting hidden flag

**Operations:**
1. Find palette by ID (throws if not found)
2. Set `hidden` field to 1
3. Save updated palette

**Parameters:**
- `id` (number): Palette ID to delete

**Return:** void

**Throws:** `NotFoundException` if palette not found

**Side Effects:**
- Updates palette hidden field to 1
- Palette excluded from future queries

**Dependencies:** Palette repository, findOne method

---

## Database Entity Relationships

### Palette Entity

**Table:** `palettes`

**Columns:**
```typescript
{
  paletteId: number;           // Primary key, auto-increment
  userId: number | null;       // Foreign key to users table (nullable)
  name: string;                // VARCHAR(255)
  colors: string;              // TEXT - JSON string array
  created_by: string;          // VARCHAR(50), default 'SYSTEM'
  createdDate: Date;           // TIMESTAMP, auto-generated
  hidden: number;              // SMALLINT, default 0
}
```

**Relationships:**

**→ User (ManyToOne, nullable)**
```typescript
@ManyToOne(() => User, (user) => user.palettes, { nullable: true })
@JoinColumn({ name: 'userId' })
user: User;
```
- Each palette optionally belongs to one user
- Foreign key: `userId`
- Nullable: System palettes can have null userId
- Inverse: User.palettes (OneToMany)

**→ WorksDone (OneToMany)**
```typescript
@OneToMany(() => WorksDone, (worksDone) => worksDone.palette)
works_done: WorksDone[];
```
- One palette can be applied to many completed works
- No cascade operations defined
- Inverse: WorksDone.palette (ManyToOne)

**→ PaletteTag (OneToMany)**
```typescript
@OneToMany(() => PaletteTag, (paletteTag) => paletteTag.palette)
paletteTags: PaletteTag[];
```
- One palette can have many tag associations
- Join table relationship through PaletteTag entity
- No cascade operations defined
- Inverse: PaletteTag.palette (ManyToOne)

**Indexes:**
- Primary key on `paletteId`
- Foreign key index on `userId`

**Constraints:**
- None specified beyond foreign keys

### Related Entity: PaletteTag

**Table:** `palette_tags`

**Purpose:** Join table connecting palettes with tags (many-to-many)

**Columns:**
```typescript
{
  paletteTagId: number;       // Primary key, auto-increment
  tagId: number;              // Foreign key to tags table
  paletteId: number;          // Foreign key to palettes table
  createdDate: Date;          // TIMESTAMP, auto-generated
  hidden: number;             // SMALLINT, default 0
}
```

**Unique Constraint:**
```typescript
@Unique(['tagId', 'paletteId'])
```
- Prevents duplicate tag-palette associations

**Relationships:**
- ManyToOne → Tag
- ManyToOne → Palette

---

## Authentication & Authorization

### JWT Authentication

**Guard:** `JwtAuthGuard`

**Applied To:** All endpoints in the controller via `@UseGuards(JwtAuthGuard)`

**Token Format:**
```
Authorization: Bearer <jwt_access_token>
```

**Token Acquisition:**
Obtain JWT token from the Auth module:
- POST `/auth/login` - Login with credentials
- POST `/auth/google` - Google OAuth login
- POST `/auth/refresh` - Refresh expired token

**Token Structure:**
```typescript
interface JwtPayload {
  sub: number;        // User ID
  email: string;      // User email
  iat: number;        // Issued at timestamp
  exp: number;        // Expiration timestamp
}
```

**Validation:**
- Token must be valid and not expired
- Token signature verified using JWT secret
- User must exist in database

**Error Handling:**
- Missing token: 401 Unauthorized
- Invalid token: 401 Unauthorized
- Expired token: 401 Unauthorized (use refresh token)

**No Special Decorators:**
- No `@Public()` endpoints - all require authentication
- No `@CurrentUser()` usage in this module
- No role-based authorization - all authenticated users can access

---

## Integration Guidelines

### Frontend Integration Checklist

**1. Authentication Setup**
```typescript
// Store JWT token after login
localStorage.setItem('access_token', token);

// Configure axios/fetch with Bearer token
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};
```

**2. Colors Data Handling**
```typescript
// When receiving palette from API
interface Palette {
  colors: string;  // JSON string
}

// Parse colors for display
const palette = await response.json();
const colorsArray: string[] = JSON.parse(palette.colors);

// When creating/updating palette
const createData = {
  name: "My Palette",
  colors: JSON.stringify(["#FF5733", "#33FF57", "#3357FF"])
};
```

**3. Error Handling**
```typescript
try {
  const response = await fetch('/palettes', { headers });
  if (response.status === 401) {
    // Redirect to login or refresh token
  }
  if (response.status === 404) {
    // Show "Palette not found" message
  }
  const data = await response.json();
} catch (error) {
  // Handle network errors
}
```

**4. Create Palette Example**
```typescript
async function createPalette(data: CreatePaletteDto) {
  const response = await fetch('http://api.example.com/palettes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: currentUserId,
      name: data.name,
      colors: JSON.stringify(data.colorArray), // Convert array to JSON string
      created_by: currentUsername
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create palette');
  }
  
  return response.json();
}
```

**5. Update Palette Example**
```typescript
async function updatePalette(id: number, updates: Partial<UpdatePaletteDto>) {
  const body: any = {};
  
  if (updates.name) body.name = updates.name;
  if (updates.colorArray) body.colors = JSON.stringify(updates.colorArray);
  
  const response = await fetch(`http://api.example.com/palettes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  return response.json();
}
```

**6. Soft Delete Example**
```typescript
async function deletePalette(id: number) {
  const response = await fetch(`http://api.example.com/palettes/delete/${id}`, {
    method: 'POST',  // Note: POST, not DELETE
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  // Returns 204 No Content on success
  return response.ok;
}
```

### Common Integration Patterns

**Display Palette Colors:**
```typescript
function PaletteDisplay({ palette }: { palette: Palette }) {
  const colors = JSON.parse(palette.colors);
  
  return (
    <div>
      <h3>{palette.name}</h3>
      <div className="color-swatches">
        {colors.map((color: string, index: number) => (
          <div 
            key={index}
            style={{ backgroundColor: color }}
            className="color-swatch"
          />
        ))}
      </div>
    </div>
  );
}
```

**Filter Palettes by Tag:**
```typescript
async function getPalettesWithTag(tagName: string) {
  const palettes = await fetch('/palettes', { headers }).then(r => r.json());
  
  return palettes.filter((palette: Palette) =>
    palette.paletteTags.some(pt => 
      pt.tag.name.toLowerCase() === tagName.toLowerCase()
    )
  );
}
```

---

## Common Use Cases

### 1. Browse All Color Palettes
```
GET /palettes
→ Returns all visible palettes with tags
```

### 2. View Specific Palette Details
```
GET /palettes/42
→ Returns palette with ID 42 and its tags
```

### 3. Create New Palette
```
POST /palettes
Body: { name, colors, userId?, created_by? }
→ Creates palette and returns it
```

### 4. Update Palette Name
```
PUT /palettes/42
Body: { name: "New Name" }
→ Updates only the name field
```

### 5. Update Palette Colors
```
PUT /palettes/42
Body: { colors: '["#AAA", "#BBB"]' }
→ Updates only the colors field
```

### 6. Soft Delete Palette
```
POST /palettes/delete/42
→ Sets hidden=1, returns 204
```

---

## Best Practices

### Colors Data Format
- Always store colors as JSON string: `JSON.stringify(array)`
- Always parse colors when reading: `JSON.parse(string)`
- Use hex color format: `#RRGGBB`
- Validate color format client-side before sending
- Consider 3-7 colors per palette for optimal UX

### Naming Conventions
- Use descriptive palette names (e.g., "Ocean Blues", "Autumn Warmth")
- Keep names under 255 characters
- Use title case for consistency

### Performance Considerations
- `findAll()` returns all palettes - consider implementing pagination for large datasets
- Tags are eagerly loaded - may impact performance with many tags
- Colors as JSON string requires parsing - consider caching parsed values

### Error Handling
- Always handle 401 errors (refresh token or redirect to login)
- Handle 404 errors gracefully (palette may have been deleted)
- Validate colors JSON format before sending to API

### Security
- All endpoints require authentication
- No public endpoints for palette data
- userId in create request should match authenticated user (validate server-side if needed)

---

## Troubleshooting

### Common Issues

**Issue:** "Palette not found" error for existing palette
- **Cause:** Palette has `hidden = 1` (soft deleted)
- **Solution:** Check if palette was previously deleted

**Issue:** Colors not displaying correctly
- **Cause:** Forgot to parse JSON string
- **Solution:** Use `JSON.parse(palette.colors)` before rendering

**Issue:** Cannot create palette - validation error
- **Cause:** Colors sent as array instead of JSON string
- **Solution:** Use `JSON.stringify(colorsArray)` before sending

**Issue:** 401 Unauthorized on all requests
- **Cause:** Missing or expired JWT token
- **Solution:** Obtain new token via login or refresh endpoint

**Issue:** Created_by showing as lowercase
- **Cause:** Expected - server converts to uppercase
- **Solution:** This is intentional behavior, no action needed

---

## Testing Examples

### cURL Examples

**Get All Palettes:**
```bash
curl -X GET http://localhost:3000/palettes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Palette by ID:**
```bash
curl -X GET http://localhost:3000/palettes/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Palette:**
```bash
curl -X POST http://localhost:3000/palettes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Test Palette",
    "colors": "[\"#FF5733\", \"#33FF57\", \"#3357FF\"]",
    "created_by": "tester"
  }'
```

**Update Palette:**
```bash
curl -X PUT http://localhost:3000/palettes/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Palette Name"
  }'
```

**Delete Palette:**
```bash
curl -X POST http://localhost:3000/palettes/delete/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Module Dependencies Summary

**Direct Dependencies:**
- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - ORM for database operations
- `class-validator` - DTO validation
- `@nestjs/swagger` - API documentation

**Internal Dependencies:**
- `entities/palette.entity` - Palette entity definition
- `modules/auth` - JWT authentication guards

**Database Tables Used:**
- `palettes` (primary)
- `users` (foreign key relationship)
- `palette_tags` (join table)
- `tags` (through palette_tags)
- `works_done` (foreign key from works_done)

---

## Changelog & Versions

This documentation reflects the current implementation as of April 24, 2026.

**Known Limitations:**
- No pagination on findAll endpoint
- No search/filter capabilities
- Colors validation done client-side only
- No audit trail for updates
- Cannot restore soft-deleted palettes via API

**Future Enhancements:**
- Add pagination and filtering
- Implement color format validation
- Add palette search by color
- Add palette usage statistics
- Implement palette versioning
- Add batch operations
