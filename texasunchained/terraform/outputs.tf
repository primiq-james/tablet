output "site_bucket_name" {
  value       = aws_s3_bucket.site.bucket
  description = "Bucket that stores the frontend assets."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.site.id
  description = "CloudFront distribution ID."
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.site.domain_name
  description = "CloudFront distribution hostname."
}

output "site_url" {
  value       = var.use_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
  description = "Primary production URL."
}

output "submissions_bucket_name" {
  value       = aws_s3_bucket.submissions.bucket
  description = "Bucket that stores movement petitions, update signups, and shop checkout requests."
}

output "forms_api_endpoint" {
  value       = aws_apigatewayv2_api.forms.api_endpoint
  description = "Direct HTTP API endpoint for form submissions."
}
