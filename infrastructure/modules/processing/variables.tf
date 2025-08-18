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

variable "documents_bucket_name" {
  description = "Name of the documents S3 bucket"
  type        = string
}

variable "documents_bucket_arn" {
  description = "ARN of the documents S3 bucket"
  type        = string
}

variable "documents_table_name" {
  description = "Name of the documents DynamoDB table"
  type        = string
}

variable "documents_table_arn" {
  description = "ARN of the documents DynamoDB table"
  type        = string
}

variable "vectors_bucket_name" {
  description = "Name of the vectors S3 bucket"
  type        = string
}

variable "vectors_bucket_arn" {
  description = "ARN of the vectors S3 bucket"
  type        = string
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda function"
  type        = number
}

variable "lambda_memory" {
  description = "Memory for the Lambda function"
  type        = number
}