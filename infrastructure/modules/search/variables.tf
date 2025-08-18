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

variable "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role for processing"
  type        = string
  default     = ""
}