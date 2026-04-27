# Designs Module - Technical Reference

## Overview

The Designs module manages user design resources in the Decor AI system. It provides CRUD operations for design entities, supporting soft deletion patterns and user-specific design management. Designs represent user-created or AI-generated interior design concepts that can be associated with prompts, images, and completed work records.

## Architecture

### Module Dependencies

**Imported Modules:**
- `TypeOrmModule.forFeature([Design])` - Provides Design entity repository
- `AuthModule` - Provides authentication guards (JWT) and strategies

**Providers:**
- `DesignsService` - Business logic for design operations

**Controllers:**
- `DesignsController` - HTTP endpoints for design management

**Exports:**
- `DesignsService` - Available for injection in other modules

### Database Schema

**Primary Entity:** `Design`
**Table Name:** `designs`

Relationships:
- **ManyToOne → User**: Each design belongs to one user
- **OneToMany → WorksDone**: A design can have multiple completed work records

## API Specification

### Base Route: `/designs`

All endpoints require JWT authentication (`@UseGuards(JwtAuthGuard)`) and must include an Authorization header with a valid Bearer token.

---

### Endpoint: GET /designs

**Description:** Retrieve all non-hidden designs across all users

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
interface DesignListResponse extends Array<DesignWithRelations> {
  // Array of design objects
}

interface DesignWithRelations {
  designId: number;
  userId: number;
  name: string | null;
  pronts: string | null;      // Design prompts/instructions
  img: string | null;          // Image URL or path
  hidden: number;              // 0 = visible, 1 = soft-deleted
  user: {
    userId: number;
    username: string;
    email: string;
    // ... other user fields
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
- Only returns designs where `hidden = 0`
- Includes related user information
- Results ordered by `designId` in descending order (newest first)
- No pagination implemented - returns all matching records

**State Changes:**
- None - Read-only operation

---

### Endpoint: GET /designs/:id

**Description:** Retrieve a single design by ID

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Design ID (converted to number internally)
}

// Headers
Authorization: Bearer <jwt_token>
```

**Response Specification:**
```typescript
// Success Response (200)
interface DesignDetailResponse {
  designId: number;
  userId: number;
  name: string | null;
  pronts: string | null;
  img: string | null;
  hidden: number;
  user: {
    userId: number;
    username: string;
    email: string;
    profileId: number;
    // ... other user fields
  };
}
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Design with ID {id} not found",
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
- Only returns design if `hidden = 0`
- Includes related user information
- Path parameter automatically converted from string to number

**State Changes:**
- None - Read-only operation

---

### Endpoint: POST /designs

**Description:** Create a new design record

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Request Body
interface CreateDesignDto {
  userId: number;         // Required - User ID who owns the design
  name?: string;          // Optional - Design name
  pronts?: string;        // Optional - Design prompts/instructions (text)
  img?: string;           // Optional - Image URL or path
}

// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**JSON Example:**
```json
{
  "userId": 123,
  "name": "Modern Living Room",
  "pronts": "Contemporary style with minimalist furniture and neutral colors",
  "img": "https://example.com/designs/living-room-123.jpg"
}
```

**Response Specification:**
```typescript
// Success Response (201)
interface CreateDesignResponse {
  designId: number;        // Auto-generated
  userId: number;
  name: string | null;
  pronts: string | null;
  img: string | null;
  hidden: number;          // Default: 0
}
```

**Error Responses:**
```typescript
// 400 Bad Request - Validation error
{
  statusCode: 400,
  message: [
    "userId must be a number",
    "name must be a string"
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
- `userId` is required and must be a valid number
- `name`, `pronts`, and `img` are optional
- `hidden` defaults to 0 (visible)
- `designId` is auto-generated (auto-increment)
- No validation that `userId` references an existing user (database constraint should handle this)

**State Changes:**
- Inserts new record into `designs` table
- No cascade operations

---

### Endpoint: PUT /designs/:id

**Description:** Update an existing design

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Design ID to update
}

// Request Body
interface UpdateDesignDto {
  name?: string;          // Optional - Update design name
  pronts?: string;        // Optional - Update prompts
  img?: string;           // Optional - Update image
  hidden?: number;        // Optional - Update visibility (0 or 1)
}

// Headers
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**JSON Example:**
```json
{
  "name": "Updated Living Room Design",
  "pronts": "Updated prompt with new requirements",
  "img": "https://example.com/designs/updated-123.jpg"
}
```

**Response Specification:**
```typescript
// Success Response (200)
interface UpdateDesignResponse {
  designId: number;
  userId: number;
  name: string | null;
  pronts: string | null;
  img: string | null;
  hidden: number;
}
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Design with ID {id} not found",
  error: "Not Found"
}

// 400 Bad Request - Validation error
{
  statusCode: 400,
  message: [
    "name must be a string",
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
- Design must exist and `hidden = 0` to be updated
- Only provided fields are updated (partial update)
- Cannot update `userId` or `designId`
- All fields in DTO are optional - can update any combination

**State Changes:**
- Updates existing record in `designs` table
- Preserves unmodified fields
- Updated timestamp not tracked (no `updated_at` column in entity)

---

### Endpoint: DELETE /designs/:id

**Description:** Soft delete a design (sets hidden = 1)

**Authentication:** Required - JWT Bearer token

**Request Specification:**
```typescript
// Path Parameters
interface PathParams {
  id: string;  // Design ID to delete
}

// Headers
Authorization: Bearer <jwt_token>
```

**Response Specification:**
```typescript
// Success Response (204)
// No content returned
```

**Error Responses:**
```typescript
// 404 Not Found
{
  statusCode: 404,
  message: "Design with ID {id} not found",
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
- Performs soft delete (sets `hidden = 1` instead of removing from database)
- Design must exist and `hidden = 0` to be deleted
- Returns HTTP 204 No Content on success
- Does NOT cascade delete to related `WorksDone` records

**State Changes:**
- Sets `hidden = 1` on the design record
- Design no longer appears in GET /designs or GET /designs/:id queries
- Related WorksDone records remain unchanged

---

## Data Transfer Objects

### CreateDesignDto
**Purpose:** Request body for POST /designs endpoint

**TypeScript Definition:**
```typescript
class CreateDesignDto {
  userId: number;         // Required
  name?: string;          // Optional
  pronts?: string;        // Optional
  img?: string;           // Optional
}
```

**Validation Rules:**
- `userId`: [@IsNumber()] - Must be a number. Required field.
- `name`: [@IsOptional(), @IsString()] - Optional string
- `pronts`: [@IsOptional(), @IsString()] - Optional string (design prompts/instructions)
- `img`: [@IsOptional(), @IsString()] - Optional string (URL or path to image)

**JSON Schema:**
```json
{
  "userId": 123,
  "name": "Example Design",
  "pronts": "Design instructions or AI prompts",
  "img": "https://example.com/image.jpg"
}
```

---

### UpdateDesignDto
**Purpose:** Request body for PUT /designs/:id endpoint

**TypeScript Definition:**
```typescript
class UpdateDesignDto {
  name?: string;          // Optional
  pronts?: string;        // Optional
  img?: string;           // Optional
  hidden?: number;        // Optional - 0 or 1
}
```

**Validation Rules:**
- `name`: [@IsOptional(), @IsString()] - Optional string
- `pronts`: [@IsOptional(), @IsString()] - Optional string
- `img`: [@IsOptional(), @IsString()] - Optional string (URL or path)
- `hidden`: [@IsOptional(), @IsNumber()] - Optional number (0 = visible, 1 = hidden)

**JSON Schema:**
```json
{
  "name": "Updated Design Name",
  "pronts": "Updated prompts",
  "img": "https://example.com/updated-image.jpg",
  "hidden": 0
}
```

**Note:** All fields are optional - can update any subset of fields.

---

## Entity Model

### Design
**Table:** `designs`

**TypeScript Definition:**
```typescript
@Entity('designs')
class Design {
  @PrimaryGeneratedColumn({ name: 'designId' })
  designId: number;                    // Primary key, auto-increment
  
  @Column({ name: 'userId' })
  userId: number;                      // Foreign key to users table
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;                        // Design name
  
  @Column({ type: 'text', nullable: true })
  pronts: string;                      // Design prompts/instructions (text field, unlimited length)
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  img: string;                         // Image URL or path
  
  @Column({ type: 'smallint', default: 0 })
  hidden: number;                      // Soft delete flag: 0 = visible, 1 = hidden
  
  @ManyToOne(() => User, (user) => user.designs)
  @JoinColumn({ name: 'userId' })
  user: User;                          // Related user entity
  
  @OneToMany(() => WorksDone, (worksDone) => worksDone.design)
  works_done: WorksDone[];             // Related work records
}
```

**Relationships:**

**User** (ManyToOne)
- Foreign key: `userId`
- Target: `users.userId`
- Cascade: Not configured
- Description: Each design belongs to one user. The user who created or owns the design.

**WorksDone** (OneToMany)
- Foreign key: `worksDone.designId`
- Target: `works_done.designId`
- Cascade: Not configured
- Description: A design can have multiple completed work records. WorksDone represents the final AI-generated output combining a design with a palette.

**Indexes:**
- Primary key: `designId` (auto-indexed)
- Foreign key: `userId` (likely indexed by database)

**Constraints:**
- `designId`: Primary key, auto-increment, NOT NULL
- `userId`: Foreign key to users table, NOT NULL
- `name`: VARCHAR(255), nullable
- `pronts`: TEXT, nullable
- `img`: VARCHAR(255), nullable
- `hidden`: SMALLINT, NOT NULL, default 0

**Notes:**
- No timestamps (`created_at`, `updated_at`) tracked on Design entity
- Soft delete pattern: `hidden` flag instead of physical deletion
- `pronts` appears to be a typo for "prompts" (design instructions or AI prompts)

---

## Service Layer

### Service Methods

#### findAll(): Promise<Design[]>
**Purpose:** Retrieve all visible designs with user information

**Parameters:**
- None

**Returns:**
```typescript
Promise<Design[]>  // Array of Design entities with user relations loaded
```

**Database Operations:**
- SELECT from `designs` table
- WHERE `hidden = 0`
- JOIN with `users` table
- ORDER BY `designId DESC`

**Throws:**
- No exceptions thrown (returns empty array if no designs found)

**Business Logic:**
- Filters out soft-deleted designs (`hidden = 1`)
- Eager loads user relationship
- Returns newest designs first

---

#### findOne(id: number): Promise<Design>
**Purpose:** Retrieve a single design by ID

**Parameters:**
```typescript
id: number  // Design ID to retrieve
```

**Returns:**
```typescript
Promise<Design>  // Single Design entity with user relation loaded
```

**Database Operations:**
- SELECT from `designs` table
- WHERE `designId = id AND hidden = 0`
- JOIN with `users` table

**Throws:**
- `NotFoundException`: Thrown when design not found or is hidden

**Business Logic:**
- Validates design exists and is not soft-deleted
- Eager loads user relationship
- Used internally by update() and remove() methods for validation

---

#### create(createDesignDto: CreateDesignDto): Promise<Design>
**Purpose:** Create a new design record

**Parameters:**
```typescript
createDesignDto: CreateDesignDto  // Design data to create
```

**Returns:**
```typescript
Promise<Design>  // Newly created Design entity
```

**Database Operations:**
- INSERT into `designs` table
- Auto-generates `designId`

**Throws:**
- Database constraint errors (e.g., invalid userId)
- Validation errors from class-validator

**Business Logic:**
- Sets `hidden = 0` by default
- All fields except `userId` are optional
- No validation that userId exists (relies on database foreign key constraint)

---

#### update(id: number, updateDesignDto: UpdateDesignDto): Promise<Design>
**Purpose:** Update an existing design

**Parameters:**
```typescript
id: number                      // Design ID to update
updateDesignDto: UpdateDesignDto  // Fields to update
```

**Returns:**
```typescript
Promise<Design>  // Updated Design entity
```

**Database Operations:**
- SELECT to verify design exists (calls findOne)
- UPDATE `designs` table with new values

**Throws:**
- `NotFoundException`: If design doesn't exist or is hidden

**Business Logic:**
- Validates design exists before updating (calls findOne)
- Uses Object.assign for partial updates
- Can update `hidden` field directly if needed
- Cannot update `userId` or `designId`

---

#### remove(id: number): Promise<void>
**Purpose:** Soft delete a design

**Parameters:**
```typescript
id: number  // Design ID to delete
```

**Returns:**
```typescript
Promise<void>  // No return value
```

**Database Operations:**
- SELECT to verify design exists (calls findOne)
- UPDATE `designs` table SET `hidden = 1`

**Throws:**
- `NotFoundException`: If design doesn't exist or is already hidden

**Business Logic:**
- Performs soft delete (sets `hidden = 1`)
- Does NOT delete from database
- Does NOT cascade to related WorksDone records
- Once hidden, design cannot be retrieved or modified through standard endpoints

---

## Authentication & Guards

**Guard Configuration:**
- **Module-level guard:** `JwtAuthGuard` applied to entire controller via `@UseGuards(JwtAuthGuard)`
- All endpoints require valid JWT token
- No public endpoints in this module

**Token Structure:**
```typescript
interface JwtPayload {
  sub: number;          // User ID
  username: string;     // Username
  email: string;        // User email
  iat: number;          // Issued at timestamp
  exp: number;          // Expiration timestamp
}
```

**Authorization Header Format:**
```
Authorization: Bearer <jwt_access_token>
```

**Token Acquisition:**
- Obtain token from `/auth/login` or `/auth/register` endpoints in AuthModule
- Token must be included in Authorization header for all requests

**Authorization Notes:**
- No user ownership validation implemented
- Any authenticated user can view, create, update, or delete any design
- Design ownership tracked via `userId` field but not enforced in business logic

---

## External Integrations

**None** - This module has no external service integrations, webhooks, or event emissions.

---

## Configuration

**Environment Variables:**
- None required for this module specifically
- Inherits authentication configuration from AuthModule (JWT secrets, etc.)

**Module Configuration:**
- No special configuration required
- Uses default TypeORM settings from root configuration

---

## Error Handling Patterns

**Exception Types:**

**NotFoundException** (404)
- **When thrown:**
  - GET /designs/:id - Design doesn't exist or is hidden
  - PUT /designs/:id - Design doesn't exist or is hidden
  - DELETE /designs/:id - Design doesn't exist or is hidden
- **Example message:** `"Design with ID 123 not found"`

**BadRequestException** (400)
- **When thrown:**
  - Validation failures on CreateDesignDto or UpdateDesignDto
- **Example messages:**
  - `"userId must be a number"`
  - `"name must be a string"`

**UnauthorizedException** (401)
- **When thrown:**
  - Missing or invalid JWT token
  - Expired token
- **Handled by:** JwtAuthGuard (from AuthModule)

**InternalServerErrorException** (500)
- **When thrown:**
  - Database connection failures
  - Unhandled exceptions
- **Handled by:** NestJS global exception filter

**Validation Error Structure:**
```typescript
{
  statusCode: 400,
  message: [
    "userId must be a number",
    "name must be a string"
  ],
  error: "Bad Request"
}
```

---

## State Management & Side Effects

**Database Transactions:**
- No explicit transactions used
- Each service method performs a single database operation
- Update and delete operations first query to verify existence

**Cascade Operations:**
- **No cascades configured**
- Deleting a design (soft delete) does NOT affect:
  - Related User record
  - Related WorksDone records
- WorksDone records will retain `designId` reference even if design is hidden

**Event Emissions:**
- None - This module does not emit events

**Soft Delete Implications:**
- Hidden designs (hidden = 1) are:
  - Excluded from GET /designs
  - Not retrievable via GET /designs/:id
  - Not updatable via PUT /designs/:id
  - Not deletable again via DELETE /designs/:id
- No mechanism to "undelete" or restore hidden designs through API

---

## Technical Constraints

**Performance Considerations:**
- **GET /designs:** No pagination - returns all visible designs. May become slow with large datasets.
- **Relations:** User relation always loaded (N+1 query pattern avoided by using `relations` option)
- **Ordering:** Results ordered by `designId DESC` - uses index on primary key

**Data Constraints:**
- `name`: Maximum 255 characters (VARCHAR limit)
- `img`: Maximum 255 characters (VARCHAR limit)
- `pronts`: TEXT field - database-dependent max size (typically 64KB for TEXT in MySQL)
- `userId`: Must reference existing user (database foreign key constraint)
- `hidden`: Must be 0 or 1 (SMALLINT type)

**Query Limitations:**
- No search or filtering capabilities
- No pagination or limit parameters
- Cannot query designs by userId, name, or other fields
- Cannot retrieve hidden designs through API

---

## Integration Notes

**Required Setup:**
1. Database table `designs` must exist with proper schema
2. AuthModule must be configured with valid JWT strategy
3. User must authenticate via `/auth/login` or `/auth/register` to obtain JWT token
4. Include JWT token in Authorization header for all requests

**Common Integration Patterns:**

**Pattern 1: Create Design Flow**
1. Authenticate user → receive JWT token
2. POST /designs with userId and design data
3. Receive created design with generated designId
4. Use designId to reference design in WorksDone or other modules

**Pattern 2: User Design Management**
1. GET /designs to retrieve all designs (no user filtering available in API)
2. Filter by userId on client side
3. Update or delete specific designs by ID

**Pattern 3: Design with Works**
1. Create design via POST /designs
2. Create palette (separate module)
3. Create WorksDone record linking designId + paletteId
4. Generate final output/images associated with WorksDone

**Known Limitations:**
- **No user authorization:** Any authenticated user can modify any design
- **No pagination:** All designs returned - performance concern at scale
- **No search/filtering:** Cannot filter designs by user, name, or date
- **No restore mechanism:** Soft-deleted designs cannot be recovered via API
- **No timestamps:** No created_at or updated_at tracking on Design entity
- **Typo in field name:** `pronts` instead of `prompts` (database schema issue)
- **No cascade delete:** Deleting user or design doesn't clean up related records

**Security Considerations:**
- Implement user ownership validation in service layer
- Add role-based access control if needed
- Consider adding rate limiting for create operations
- Validate image URLs to prevent SSRF attacks
- Sanitize `pronts` field if rendered in frontend to prevent XSS

**Recommended Enhancements:**
1. Add pagination to GET /designs
2. Add query parameters for filtering (by userId, date range, etc.)
3. Implement user ownership checks
4. Add timestamps (created_at, updated_at)
5. Add endpoint to restore soft-deleted designs
6. Fix typo: rename `pronts` to `prompts`
7. Add cascade delete configuration for data cleanup
8. Add design count/statistics endpoints
9. Implement full-text search on name and prompts fields
