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

variable "documents_table_name" {
  description = "Name of the documents DynamoDB table"
  type        = string
}

variable "documents_table_arn" {
  description = "ARN of the documents DynamoDB table"
  type        = string
}

variable "chat_sessions_table_name" {
  description = "Name of the chat sessions DynamoDB table"
  type        = string
}

variable "chat_sessions_table_arn" {
  description = "ARN of the chat sessions DynamoDB table"
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

variable "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  type        = string
}
variable "user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  type        = string
}

variable "chat_messages_table_name" {
  description = "Name of the chat messages DynamoDB table"
  type        = string
}

variable "chat_messages_table_arn" {
  description = "ARN of the chat messages DynamoDB table"
  type        = string
}