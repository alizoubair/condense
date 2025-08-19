# Core Configuration
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-west-2"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "AWS region must be in the format 'us-west-2'."
  }
}

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "condense"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# Amplify Configuration
variable "repository_url" {
  description = "Git repository URL for the Amplify app"
  type        = string
  default     = ""

  validation {
    condition     = var.repository_url == "" || can(regex("^https://github\\.com/.+", var.repository_url))
    error_message = "Repository URL must be a valid GitHub HTTPS URL or empty string."
  }
}

variable "github_access_token" {
  description = "GitHub access token for the Amplify app"
  type        = string
  default     = ""
}

variable "branch_name" {
  description = "Git branch name to deploy"
  type        = string
  default     = "main"
}

variable "domain_name" {
  description = "Custom domain name for the Amplify app (optional)"
  type        = string
  default     = null
}

# Lambda Configuration
variable "lambda_timeout" {
  description = "Default timeout for Lambda functions in seconds"
  type        = number
  default     = 300

  validation {
    condition     = var.lambda_timeout >= 30 && var.lambda_timeout <= 900
    error_message = "Lambda timeout must be between 30 and 900 seconds."
  }
}

variable "lambda_memory_size" {
  description = "Default memory size for Lambda functions in MB"
  type        = number
  default     = 1024

  validation {
    condition     = var.lambda_memory_size >= 128 && var.lambda_memory_size <= 10240
    error_message = "Lambda memory size must be between 128 and 10240 MB."
  }
}

# Feature Flags
variable "enable_custom_domain" {
  description = "Enable custom domain for Amplify app"
  type        = bool
  default     = false
}

variable "enable_monitoring" {
  description = "Enable enhanced monitoring and alerting"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable automated backups for DynamoDB"
  type        = bool
  default     = true
}

# Cost Optimization
variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"

  validation {
    condition     = contains(["PAY_PER_REQUEST", "PROVISIONED"], var.dynamodb_billing_mode)
    error_message = "DynamoDB billing mode must be either PAY_PER_REQUEST or PROVISIONED."
  }
}

# Security
variable "allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "enable_waf" {
  description = "Enable AWS WAF for API Gateway"
  type        = bool
  default     = false
}