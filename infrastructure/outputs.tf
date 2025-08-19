# Frontend Outputs
output "amplify_app_url" {
  description = "Amplify application URL"
  value       = module.amplify.amplify_app_url
}

output "amplify_app_id" {
  description = "Amplify App ID"
  value       = module.amplify.amplify_app_id
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = module.amplify.custom_domain_url
}

# API Outputs
output "rest_api_url" {
  description = "REST API Gateway URL"
  value       = module.api.rest_api_url
}

output "rest_api_id" {
  description = "REST API Gateway ID"
  value       = module.api.rest_api_id
}

output "websocket_api_url" {
  description = "WebSocket API Gateway URL"
  value       = module.chat.websocket_api_url
}

output "websocket_api_id" {
  description = "WebSocket API Gateway ID"
  value       = module.chat.websocket_api_id
}

# Authentication Outputs
output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.auth.user_pool_id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.auth.user_pool_client_id
}

output "identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = module.auth.identity_pool_id
}

# Storage Outputs
output "documents_bucket_name" {
  description = "Name of the documents S3 bucket"
  value       = module.storage.documents_bucket_name
}

output "documents_table_name" {
  description = "Name of the documents DynamoDB table"
  value       = module.storage.documents_table_name
}

output "chat_sessions_table_name" {
  description = "Name of the chat sessions DynamoDB table"
  value       = module.storage.chat_sessions_table_name
}

# Processing Outputs
output "step_function_arn" {
  description = "ARN of the document processing Step Function"
  value       = module.processing.step_function_arn
}

output "processing_queue_url" {
  description = "URL of the document processing SQS queue"
  value       = module.processing.processing_queue_url
}

# Summary Output for Easy Reference
output "deployment_summary" {
  description = "Summary of key deployment information"
  value = {
    project_name = var.project_name
    environment  = var.environment
    region       = var.aws_region

    # Frontend
    app_url = module.amplify.amplify_app_url

    # APIs
    rest_api  = module.api.rest_api_url
    websocket = module.chat.websocket_api_url

    # Authentication
    user_pool_id = module.auth.user_pool_id

    # Key resources
    documents_bucket = module.storage.documents_bucket_name
  }
}
