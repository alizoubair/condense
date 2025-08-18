output "documents_bucket_name" {
  description = "Name of the documents S3 bucket"
  value       = aws_s3_bucket.documents.bucket
}

output "documents_bucket_arn" {
  description = "ARN of the documents S3 bucket"
  value       = aws_s3_bucket.documents.arn
}

output "processed_documents_bucket_name" {
  description = "Name of the processed documents S3 bucket"
  value       = aws_s3_bucket.processed_documents.bucket
}

output "documents_table_name" {
  description = "Name of the documents DynamoDB table"
  value       = aws_dynamodb_table.documents.name
}

output "documents_table_arn" {
  description = "ARN of the documents DynamoDB table"
  value       = aws_dynamodb_table.documents.arn
}

output "chat_sessions_table_name" {
  description = "Name of the chat sessions DynamoDB table"
  value       = aws_dynamodb_table.chat_sessions.name
}

output "chat_sessions_table_arn" {
  description = "ARN of the chat sessions DynamoDB table"
  value       = aws_dynamodb_table.chat_sessions.arn
}

output "profiles_table_name" {
  description = "Name of the profiles DynamoDB table"
  value       = aws_dynamodb_table.profiles.name
}

output "profiles_table_arn" {
  description = "ARN of the profiles DynamoDB table"
  value       = aws_dynamodb_table.profiles.arn
}

output "chat_messages_table_name" {
  description = "Name of the chat messages DynamoDB table"
  value       = aws_dynamodb_table.chat_messages.name
}

output "chat_messages_table_arn" {
  description = "ARN of the chat messages DynamoDB table"
  value       = aws_dynamodb_table.chat_messages.arn
}