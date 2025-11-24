# AWS Setup per CI/CD

Guida completa per configurare AWS con le **best practices di sicurezza**.

---

## Indice

1. [Metodo di Autenticazione](#metodo-di-autenticazione)
2. [Setup OIDC (Raccomandato)](#setup-oidc-raccomandato)
3. [IAM Policy Minime](#iam-policy-minime)
4. [Configurazione S3 Bucket](#configurazione-s3-bucket)
5. [CloudFront (Opzionale)](#cloudfront-opzionale)

---

## Metodo di Autenticazione

### OIDC vs Access Keys

| Metodo | Sicurezza | Raccomandato |
|--------|-----------|--------------|
| **OIDC** | Alta - Token temporanei, no secrets da ruotare | ✅ Sì |
| Access Keys | Media - Credentials statiche, rischio di leak | ❌ No |

**AWS raccomanda OIDC** perché:
- Nessuna credential da gestire o ruotare
- Token temporanei (validi solo per la durata del job)
- Audit trail completo in CloudTrail

---

## Setup OIDC (Raccomandato)

### Step 1: Crea OIDC Identity Provider

1. Vai su AWS Console → IAM → Identity providers
2. Click "Add provider"
3. Configura:
   - **Provider type**: OpenID Connect
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
4. Click "Get thumbprint" → "Add provider"

### Step 2: Crea IAM Role

1. Vai su IAM → Roles → Create role
2. **Trusted entity type**: Web identity
3. **Identity provider**: `token.actions.githubusercontent.com`
4. **Audience**: `sts.amazonaws.com`
5. Click "Next"

### Step 3: Configura Trust Policy

Modifica la trust policy per limitare l'accesso al tuo repository:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::{{AWS_ACCOUNT_ID}}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:{{GITHUB_ORG}}/{{REPO_NAME}}:*"
        }
      }
    }
  ]
}
```

**Sostituisci:**
- `{{AWS_ACCOUNT_ID}}` - Il tuo account ID AWS (es: `123456789012`)
- `{{GITHUB_ORG}}` - La tua org GitHub (es: `my-company`)
- `{{REPO_NAME}}` - Nome del repository (es: `my-app`)

### Step 4: Usa nel Workflow

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::{{AWS_ACCOUNT_ID}}:role/{{ROLE_NAME}}
    aws-region: eu-west-1

- name: Deploy to S3
  run: aws s3 sync ./dist s3://my-bucket --delete
```

---

## IAM Policy Minime

### Solo S3 (Deploy Statico)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DeployAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::{{BUCKET_NAME}}",
        "arn:aws:s3:::{{BUCKET_NAME}}/*"
      ]
    }
  ]
}
```

### S3 + CloudFront (Con Invalidation)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DeployAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::{{BUCKET_NAME}}",
        "arn:aws:s3:::{{BUCKET_NAME}}/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig"
      ],
      "Resource": "arn:aws:cloudfront::{{AWS_ACCOUNT_ID}}:distribution/{{DISTRIBUTION_ID}}"
    }
  ]
}
```

---

## Configurazione S3 Bucket

### Crea Bucket per Static Hosting

```bash
# Crea bucket
aws s3 mb s3://my-app-deploy --region eu-west-1

# Abilita static website hosting
aws s3 website s3://my-app-deploy \
  --index-document index.html \
  --error-document index.html
```

### Bucket Policy per Accesso Pubblico

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::{{BUCKET_NAME}}/*"
    }
  ]
}
```

### CORS Configuration (se necessario)

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

---

## CloudFront (Opzionale)

### Perché usare CloudFront

- **CDN globale** - Contenuti più vicini agli utenti
- **HTTPS gratuito** - Certificate Manager integration
- **Caching** - Riduce load su S3
- **Custom domain** - Supporto Route 53

### Setup Base

1. Vai su CloudFront → Create distribution
2. **Origin domain**: Seleziona il tuo bucket S3
3. **Origin access**: Origin access control settings (recommended)
4. **Default root object**: `index.html`
5. **Viewer protocol policy**: Redirect HTTP to HTTPS

### Invalidation dopo Deploy

Aggiungi al workflow:

```yaml
- name: Invalidate CloudFront
  run: |
    aws cloudfront create-invalidation \
      --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
      --paths "/*"
```

---

## Checklist Sicurezza

- [ ] Usa OIDC invece di Access Keys
- [ ] IAM Policy con permessi minimi
- [ ] Trust policy limitata al tuo repository
- [ ] Bucket non pubblico (usa CloudFront OAC)
- [ ] HTTPS abilitato
- [ ] Logging abilitato su S3/CloudFront
- [ ] Versioning S3 abilitato (per rollback)

---

## Troubleshooting

### Errore "Access Denied"

1. Verifica che il role ARN sia corretto
2. Controlla la trust policy (org/repo corretti)
3. Verifica i permessi nella IAM policy

### Errore OIDC "Not authorized"

1. Verifica che l'OIDC provider sia configurato
2. Controlla audience (`sts.amazonaws.com`)
3. Verifica il formato del subject claim

### Debug

```yaml
- name: Debug AWS Identity
  run: aws sts get-caller-identity
```

---

## Risorse

- [AWS: Use IAM roles with GitHub Actions](https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/)
- [GitHub: Configuring OIDC in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
