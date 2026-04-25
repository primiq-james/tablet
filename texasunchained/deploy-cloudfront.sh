#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_BIN="${ROOT_DIR}/bin/terraform"
AWS_BIN="${HOME}/Library/Python/3.9/bin/aws"
TF_DIR="${ROOT_DIR}/terraform"
FRONTEND_DIR="${ROOT_DIR}/frontend"

if [[ ! -x "${TERRAFORM_BIN}" ]]; then
  echo "Missing terraform binary at ${TERRAFORM_BIN}"
  exit 1
fi

if [[ ! -x "${AWS_BIN}" ]]; then
  echo "Missing aws CLI at ${AWS_BIN}"
  exit 1
fi

echo "Checking AWS identity..."
"${AWS_BIN}" sts get-caller-identity >/dev/null

echo "Initializing Terraform..."
"${TERRAFORM_BIN}" -chdir="${TF_DIR}" init

echo "Applying CloudFront stack..."
"${TERRAFORM_BIN}" -chdir="${TF_DIR}" apply -auto-approve -var="use_custom_domain=false"

BUCKET_NAME="$("${TERRAFORM_BIN}" -chdir="${TF_DIR}" output -raw site_bucket_name)"
DISTRIBUTION_ID="$("${TERRAFORM_BIN}" -chdir="${TF_DIR}" output -raw cloudfront_distribution_id)"
SITE_URL="$("${TERRAFORM_BIN}" -chdir="${TF_DIR}" output -raw site_url)"

echo "Syncing frontend assets..."
"${AWS_BIN}" s3 sync "${FRONTEND_DIR}" "s3://${BUCKET_NAME}" --delete

echo "Invalidating CloudFront cache..."
"${AWS_BIN}" cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*" >/dev/null

echo
echo "Deployment complete:"
echo "${SITE_URL}"
