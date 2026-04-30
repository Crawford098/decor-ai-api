# AWS S3 Setup Guide — Workdone Image Storage

This guide walks you through creating and configuring the S3 bucket used to store AI-generated images from the `workdone/generate` endpoint.

---

## Prerequisites

- An AWS account ([aws.amazon.com](https://aws.amazon.com))
- AWS CLI installed (optional but recommended): `brew install awscli`

---

## Step 1 — Create the S3 Bucket

1. Go to the [AWS S3 Console](https://s3.console.aws.amazon.com/s3)
2. Click **Create bucket**
3. Set the following:
   - **Bucket name**: e.g. `decor-ai-workdone` *(must be globally unique)*
   - **AWS Region**: choose your closest region (e.g. `us-east-1`)
   - **Object Ownership**: keep `ACLs disabled` (recommended)
4. **Block Public Access settings**:
   - If images should be **publicly readable** (users can access the URL directly):
     - Uncheck **Block all public access** → confirm the warning
   - If you prefer **private access** with signed URLs (more secure):
     - Leave all blocks **enabled**
     - ⚠️ In this case, update `S3Service.uploadBuffer()` to generate presigned URLs for reads
5. Leave all other defaults and click **Create bucket**

---

## Step 2 — Configure Bucket CORS (if frontend accesses images directly)

1. Open your new bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)**
2. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

> Replace `"*"` in `AllowedOrigins` with your frontend domain in production (e.g. `"https://app.decor-ai.com"`).

3. Click **Save changes**

---

## Step 3 — Add a Bucket Policy for Public Read (if applicable)

If you chose public access in Step 1, add this bucket policy so objects are readable:

1. **Permissions** tab → **Bucket policy** → **Edit**
2. Replace `YOUR_BUCKET_NAME` and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. Click **Save changes**

---

## Step 4 — Create an IAM User with Minimal Permissions

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam) → **Users** → **Create user**
2. **User name**: `decor-ai-api-s3`
3. Select **Attach policies directly** → click **Create policy**
4. In the policy editor choose **JSON** and paste (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

5. Name the policy `DecorAiS3WorkdonePolicy` → **Create policy**
6. Back on the user creation screen, search and attach `DecorAiS3WorkdonePolicy`
7. Click **Create user**

---

## Step 5 — Generate Access Keys

1. Open the newly created user → **Security credentials** tab
2. Click **Create access key**
3. Select **Application running outside AWS** → **Next** → **Create access key**
4. **Copy both values immediately** (secret is only shown once):
   - `Access key ID`
   - `Secret access key`

---

## Step 6 — Configure Your `.env` File

Add the following variables to your `.env`:

```env
# AWS S3 — Workdone image storage
AWS_REGION=us-east-1                          # Region where the bucket was created
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE        # From Step 5
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # From Step 5
AWS_S3_BUCKET_DECORAI=decorAI     # Your bucket name from Step 1
```

---

## Resulting Image URL Format

Images will be publicly accessible at:

```
https://<AWS_S3_BUCKET_DECORAI>.s3.<AWS_REGION>.amazonaws.com/workdone/<userId>/<uuid>.png
```

Example:
```
https://decorai.s3.us-east-1.amazonaws.com/workdone/42/f3b2c1d4-0e5f-4a6b-8c7d-9e0f1a2b3c4d.png
```

---

## Tips

- **Never commit** your `.env` file or AWS credentials to version control
- Use **AWS Secrets Manager** or environment-level secrets in production
- Consider enabling **S3 Versioning** for disaster recovery
- Set a **lifecycle rule** to transition old images to `S3 Glacier` after 90 days to reduce costs
