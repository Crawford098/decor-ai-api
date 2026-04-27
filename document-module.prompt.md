---
name: document-module
description: Analyze and document a NestJS backend module for frontend integration
argument-hint: module name (e.g., auth, designs, palettes, payments)
---

# Backend Module Technical Documentation

Analyze the **{{arg}}** backend module and generate comprehensive technical documentation that enables frontend developers to understand the module's architecture, API contracts, and integration requirements.

## Analysis Structure

Examine the following components of the module located in `src/modules/{{arg}}/`:

### 1. **API Endpoints (Controller)**
For each endpoint in the controller (`{{arg}}.controller.ts`):
- HTTP Method (GET, POST, PUT, DELETE, PATCH)
- Full route path (include controller prefix)
- Functionality description (from @ApiOperation or comments)
- Request parameters:
  - Path parameters (e.g., `:id`)
  - Query parameters (e.g., `?limit=10`)
  - Request body (complete object with types)
  - Special headers required
- Authentication requirements:
  - JWT token required? (@UseGuards(JwtAuthGuard))
  - Public endpoint? (@Public())
  - Specific roles required?
- Success response:
  - HTTP status code (e.g., 200, 201, 204)
  - Response structure (DTO or return type)
  - Type definitions
- Error responses:
  - Possible error status codes
  - Error response structure
  - Common error scenarios

### 2. **DTOs (Data Transfer Objects)**
For each DTO in `dto/{{arg}}.dto.ts`:
- DTO name and purpose (Request/Response)
- Fields with:
  - Data type
  - Validation rules (@IsString, @IsEmail, @MinLength, etc.)
  - Required vs optional
  - Constraints and limits
- Complete TypeScript interface representation

### 3. **Business Logic (Service)**
From `{{arg}}.service.ts`, document:
- Primary methods and their purpose
- Injected dependencies (other services, repositories)
- Database entities utilized
- Critical operations (transactions, external calls)
- Important business rules and constraints
- Side effects and state changes

### 4. **Authentication & Authorization**
If the module has guards or strategies:
- Supported authentication types (JWT, Local, Google OAuth, etc.)
- Token acquisition flow
- Token inclusion in requests (Bearer token format)
- Special decorators (@CurrentUser, @Public, etc.)
- Refresh token mechanism if applicable

### 5. **Entity Relationships**
From entities in `src/entities/`:
- Entities related to this module
- Relationship types (OneToMany, ManyToOne, ManyToMany)
- Key fields for references (IDs, foreign keys)
- Cascade behaviors
- Database constraints

### 6. **Configuration & Environment**
If the module uses ConfigService:
- Required environment variables
- Default values
- Critical configurations
- Optional vs required settings

### 7. **External Integrations**
Document any external service integrations:
- Third-party APIs consumed
- Webhooks (incoming/outgoing)
- Event emitters/listeners
- Message queues
- External service dependencies

## Output Format

Generate a structured markdown document:

```markdown
# {{arg}} Module - Technical Reference

## Overview
[Concise description of module purpose and responsibilities]

## Architecture

### Module Dependencies
- **Imported Modules:** [List of NestJS modules]
- **Providers:** [Services, repositories, strategies, guards]
- **Exports:** [What this module exposes to other modules]

### Database Schema
[Entity structure and relationships]

## API Specification

### Endpoint: [METHOD] [ROUTE]

**Description:** [Functionality]

**Authentication:** [Required/Optional - Type]

**Request Specification:**
\`\`\`typescript
// Path Parameters
interface PathParams {
  param: type;  // Description
}

// Query Parameters
interface QueryParams {
  param?: type;  // Description, default value
}

// Request Body
interface RequestBody {
  field: type;         // Required - Validations: [list]
  optionalField?: type;  // Optional - Validations: [list]
}

// Headers
Authorization: Bearer <jwt_token>  // If required
Content-Type: application/json
\`\`\`

**Response Specification:**
\`\`\`typescript
// Success Response (XXX)
interface SuccessResponse {
  field: type;  // Description
}
\`\`\`

**Error Responses:**
\`\`\`typescript
// 400 Bad Request
{
  statusCode: 400,
  message: string | string[],  // Validation errors
  error: "Bad Request"
}

// 401 Unauthorized
{
  statusCode: 401,
  message: string,
  error: "Unauthorized"
}

// 404 Not Found
{
  statusCode: 404,
  message: string,
  error: "Not Found"
}
\`\`\`

**Business Rules:**
- [Rule 1: Constraint or behavior]
- [Rule 2: Side effect or validation]

**State Changes:**
- [What database changes occur]
- [What side effects are triggered]

[Repeat for each endpoint]

## Data Transfer Objects

### DTOName
**Purpose:** [Usage context - Request/Response for which endpoints]

**TypeScript Definition:**
\`\`\`typescript
class DTOName {
  field: type;         // Required - Validation: @Decorator() - Constraint
  optional?: type;     // Optional - Validation: @Decorator() - Constraint
}
\`\`\`

**Validation Rules:**
- `field`: [@IsString(), @MinLength(3), @MaxLength(50)] - Description
- `optional`: [@IsNumber(), @Min(0)] - Description

**JSON Schema:**
\`\`\`json
{
  "field": "value conforming to validation",
  "optional": "value if provided"
}
\`\`\`

[Repeat for each DTO]

## Entity Model

### EntityName
**Table:** `table_name`

**TypeScript Definition:**
\`\`\`typescript
@Entity('table_name')
class EntityName {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type, nullable, unique, default })
  field: type;
  
  @ManyToOne(() => RelatedEntity, (entity) => entity.collection)
  relation: RelatedEntity;
}
\`\`\`

**Relationships:**
- **RelatedEntity** (ManyToOne/OneToMany/ManyToMany)
  - Foreign key: `field_id`
  - Cascade: [true/false] - [behavior]
  - Description: [relationship purpose]

**Indexes:**
- [Field(s) indexed and why]

**Constraints:**
- [Unique constraints]
- [Check constraints]
- [Not null constraints]

## Service Layer

### Service Methods

#### methodName(params)
**Purpose:** [What this method does]

**Parameters:**
\`\`\`typescript
param: type  // Description
\`\`\`

**Returns:**
\`\`\`typescript
Promise<ReturnType>  // Description
\`\`\`

**Database Operations:**
- [SELECT/INSERT/UPDATE/DELETE operations performed]

**Throws:**
- `ExceptionType`: [When and why]

**Business Logic:**
- [Rule 1]
- [Rule 2]

[Repeat for key service methods]

## Authentication & Guards

**Guard Configuration:**
- **Global guards:** [List if any]
- **Module-specific guards:** [List and purpose]

**Token Structure:**
\`\`\`typescript
interface JwtPayload {
  sub: number;    // User ID
  username: string;
  // ... other claims
}
\`\`\`

**Authorization Header Format:**
\`\`\`
Authorization: Bearer <jwt_access_token>
\`\`\`

## External Integrations

### Service: ServiceName
**Purpose:** [Why integrated]
**Endpoints Used:** [External API endpoints]
**Authentication:** [API key, OAuth, etc.]
**Webhooks:** [If applicable - incoming/outgoing]
**Event Triggers:** [What triggers external calls]
**Error Handling:** [How external failures are handled]

## Configuration

**Environment Variables:**
\`\`\`bash
VARIABLE_NAME=value  # Required/Optional - Description - Default: value
\`\`\`

**Module Configuration:**
\`\`\`typescript
// From module registration
ConfigOption: value  // Description
\`\`\`

## Error Handling Patterns

**Exception Types:**
- `BadRequestException`: [When thrown - Examples]
- `UnauthorizedException`: [When thrown - Examples]
- `NotFoundException`: [When thrown - Examples]
- `ConflictException`: [When thrown - Examples]
- `InternalServerErrorException`: [When thrown - Examples]

**Validation Error Structure:**
\`\`\`typescript
{
  statusCode: 400,
  message: [
    "field must be a string",
    "field must be longer than 3 characters"
  ],
  error: "Bad Request"
}
\`\`\`

## State Management & Side Effects

**Database Transactions:**
- [Where transactions are used]
- [Rollback scenarios]

**Cascade Operations:**
- [What happens when parent entities are deleted/updated]

**Event Emissions:**
- [Events emitted by this module]
- [Event subscribers]

## Technical Constraints

**Performance Considerations:**
- [Query limitations]
- [Pagination requirements]
- [Rate limiting if applicable]

**Data Constraints:**
- [Size limits]
- [Format requirements]
- [Business rule constraints]

## Integration Notes

**Required Setup:**
1. [Prerequisite 1]
2. [Prerequisite 2]

**Common Integration Patterns:**
- [Pattern 1: Description]
- [Pattern 2: Description]

**Known Limitations:**
- [Limitation 1]
- [Limitation 2]
```

## Execution Instructions

1. Read all files in the module `src/modules/{{arg}}/`
2. Read corresponding DTOs
3. Read related entities in `src/entities/`
4. Read relevant interfaces
5. Analyze dependencies in the module file
6. Identify external service integrations
7. Document webhook configurations if present
8. Generate complete technical documentation following the format
9. Be exhaustive and precise - provide implementation-agnostic technical specifications

**Focus:** Technical precision. Provide complete API contracts, data structures, business rules, and architectural patterns without prescribing frontend implementation approaches.
