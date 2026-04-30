# Setup Checklist — workdone/generate

Sigue estos pasos en orden. Cada uno es necesario para que el endpoint funcione.

---

## Paso 1 — Crear el archivo `.env`

El repositorio solo tiene `.env.example`. Copia y edita el `.env` real:

```bash
cp .env.example .env
```

Luego rellena todos los valores según los pasos siguientes.

> ⚠️ **Bug corregido:** el `.env.example` original tenía `DATABASE_URL` (estilo Prisma), pero
> la app usa variables individuales (`DB_HOST`, `DB_PORT`, etc.). Ya fue actualizado.

---

## Paso 2 — Configurar PostgreSQL

Rellena en `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=decor_ai
```

**2.1 — Instalar PostgreSQL** (si no lo tienes):

```bash
brew install postgresql@15
brew services start postgresql@15
```

**2.2 — Crear la base de datos:**

```bash
psql -U postgres -c "CREATE DATABASE decor_ai;"
```

**2.3 — Crear las tablas**

Las migraciones no están incluidas en el repo y `synchronize: false` está activo.
Las tablas requeridas son: `users`, `profiles`, `palettes`, `palette_tags`, `tags`, `designs`, `works_done`, `images`.

- **Opción A (más rápida — solo para desarrollo):** Activar `synchronize: true`
  temporalmente en `src/app.module.ts`, arrancar la app una vez para que TypeORM
  cree las tablas, y luego volver a `false`.

- **Opción B:** Si tienes el SQL del esquema, ejecútalo directamente:

  ```bash
  psql -U postgres -d decor_ai -f schema.sql
  ```

---

## Paso 3 — API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión → **Create new secret key**
3. Copia el valor en `.env`:

```env
OPENAI_API_KEY=sk-proj-...
```

> ⚠️ **El endpoint usa DALL-E 3** para generar imágenes. Este modelo **requiere créditos
> de pago** — el tier gratuito de OpenAI no lo incluye.
> Verifica tu saldo en: https://platform.openai.com/account/billing

---

## Paso 4 — Generar JWT Secrets

Ejecuta este comando **dos veces** para obtener dos strings seguros distintos:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia cada resultado en `.env`:

```env
JWT_SECRET=<primer_string_generado>
JWT_REFRESH_SECRET=<segundo_string_generado>
JWT_ACCESS_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800
```

---

## Paso 5 — Configurar AWS S3

Sigue la guía completa en **[S3_SETUP.md](./S3_SETUP.md)**.

Resumen de lo que debes hacer allí:
- Crear un bucket S3 (ej. `decor-ai-workdone`)
- Crear usuario IAM con política mínima (`s3:PutObject`, `s3:GetObject`)
- Generar Access Key + Secret Key para ese usuario

Al terminar, rellena en `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_DECORAI=decorAI
```

---

## Paso 6 — Verificar el `.env` mínimo completo

Antes de arrancar, confirma que estas variables están definidas en tu `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=decor_ai

OPENAI_API_KEY=sk-proj-...

JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_DECORAI=decorai
```

---

## Paso 7 — Arrancar la app

```bash
npm run start:dev
```

Deberías ver:

```
Decor AI API is running at http://localhost:3000
Swagger docs available at http://localhost:3000/api/docs
```

---

## Paso 8 — Probar el endpoint

### 8.1 — Registrar / iniciar sesión para obtener un token JWT

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "tu_usuario_o_email",
  "password": "tu_password"
}
```

Copia el `accessToken` de la respuesta.

### 8.2 — Llamar al endpoint de generación

```http
POST http://localhost:3000/api/workdone/generate
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": 1,
  "designId": 1,
  "paletteId": 1,
  "customPrompt": "Modern Scandinavian style with large windows and natural light"
}
```

### Respuesta esperada (201):

```json
{
  "workDone": {
    "worldId": 1,
    "userId": 1,
    "designId": 1,
    "paletteId": 1,
    "final_pront": "Design description: ... Color palette to apply: ... Additional instructions: ...",
    "hidden": 0
  },
  "image": {
    "imageId": 1,
    "worldId": 1,
    "path": "https://decor-ai-workdone.s3.us-east-1.amazonaws.com/workdone/1/<uuid>.png",
    "date": "2026-04-27",
    "hidden": 0
  }
}
```

---

## Errores comunes y soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot connect to database` | PostgreSQL no corre o vars incorrectas | Verificar Paso 2 |
| `401 Unauthorized` | Token faltante o expirado | Re-login y usar nuevo token |
| `404 Design not found` | `designId` no existe o `hidden=1` | Verificar que el design existe en DB |
| `404 Palette not found` | `paletteId` no existe o `hidden=1` | Verificar que la palette existe en DB |
| `OpenAI 429 Too Many Requests` | Sin créditos en OpenAI | Agregar saldo en platform.openai.com/account/billing |
| `OpenAI billing_hard_limit_reached` | Límite de gasto alcanzado | Subir el límite en platform.openai.com |
| `S3 upload failed: AccessDenied` | Usuario IAM sin permiso `s3:PutObject` | Revisar política IAM en S3_SETUP.md Paso 4 |
| `S3 upload failed: NoSuchBucket` | Bucket no existe o nombre incorrecto | Verificar `AWS_S3_BUCKET_DECORAI` en `.env` |
| `ConfigService: AWS_REGION is required` | Variable de entorno faltante | Agregar la variable al `.env` |
