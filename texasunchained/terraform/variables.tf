variable "project_name" {
  description = "Project name prefix."
  type        = string
  default     = "texasunchained"
}

variable "aws_region" {
  description = "Primary AWS region for the site bucket and Route53 records."
  type        = string
  default     = "us-east-2"
}

variable "domain_name" {
  description = "Primary apex domain for the site."
  type        = string
  default     = "texasunchained.com"
}

variable "hosted_zone_name" {
  description = "Existing Route53 hosted zone name."
  type        = string
  default     = "texasunchained.com"
}

variable "use_custom_domain" {
  description = "Whether to attach the apex/www custom domain and Route53 records."
  type        = bool
  default     = false
}
