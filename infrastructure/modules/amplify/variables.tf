variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "repository_url" {
  description = "Git repository URL for the Amplify app"
  type        = string
}

variable "github_access_token" {
  description = "GitHub access token for the Amplify app"
  type        = string
  sensitive   = true
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

variable "user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

variable "identity_pool_id" {
  description = "Cognito Identity Pool ID"
  type        = string
}

variable "rest_api_url" {
  description = "REST API Gateway URL"
  type        = string
}

variable "websocket_api_url" {
  description = "WebSocket API Gateway URL"
  type        = string
}