# Texas Unchained

Texas Unchained is a new website project for `texasunchained.com`.

This first version includes:

- a premium static frontend with a dark political/editorial visual language
- a `News` page seeded with structured placeholder stories
- an article template page driven by a reusable article data model
- dedicated pages for `Join the Movement`, `Get Updates`, `Donate`, and `Shop`
- form submission plumbing that stores petition signers, update subscribers, and shop checkout requests in AWS
- Terraform for AWS static hosting on `texasunchained.com`

## Project structure

```text
texasunchained/
├── frontend/
│   ├── index.html
│   ├── news.html
│   ├── article.html
│   └── assets/
│       ├── css/styles.css
│       ├── js/
│       │   ├── app.js
│       │   ├── article-page.js
│       │   ├── news-data.js
│       │   └── news-page.js
│       └── images/news/
└── terraform/
    ├── providers.tf
    ├── variables.tf
    ├── main.tf
    └── outputs.tf
```

## Frontend

The frontend is intentionally dependency-free so it can be previewed immediately and later migrated to a framework or CMS if needed.

Key pages:

- `frontend/index.html`
- `frontend/news.html`
- `frontend/article.html`
- `frontend/join.html`
- `frontend/updates.html`
- `frontend/shop.html`
- `frontend/donate.html`

The News page is built from a reusable `articles` array in:

- `frontend/assets/js/news-data.js`

Each article uses this shape:

- `title`
- `slug`
- `category`
- `author`
- `publishDate`
- `excerpt`
- `heroImage`
- `bodyContent`
- `featured`

## Local preview

From the `frontend` directory, start a simple static server:

```bash
cd frontend
python3 -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173`

## Terraform

The Terraform stack provisions:

- an S3 bucket for site assets
- an S3 bucket for petition/update/shop submissions
- an HTTP API and Lambda for form ingestion
- a CloudFront distribution
- ACM certificates in `us-east-1`
- Route53 DNS records for `texasunchained.com` and `www.texasunchained.com`

Assumptions:

- you already have a public Route53 hosted zone for `texasunchained.com`
- you have AWS credentials configured locally

### Terraform commands

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Deploy the frontend assets after apply

After infrastructure exists, upload the static site:

```bash
aws s3 sync ../frontend s3://texasunchained.com --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Notes

- The News content is placeholder editorial scaffolding, not factual reporting.
- The movement copy is intentionally independent-minded and does not treat state officials as above criticism.
- The foreign conflict language is included in the homepage platform framing: Texas would never strike first, but it would defend hard if threatened.
