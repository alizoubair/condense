# Storage Module - S3 buckets and DynamoDB tables
module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Configuration
  billing_mode = local.config.dynamodb_billing_mode
}

# Search Module - S3 bucket for vector storage
module "search" {
  source = "./modules/search"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}

# Authentication Module - Cognito user management
module "auth" {
  source = "./modules/auth"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}

# Processing Module - Step Functions orchestrated document processing
module "processing" {
  source = "./modules/processing"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Lambda configuration
  lambda_timeout = local.config.lambda_timeout
  lambda_memory  = local.config.lambda_memory

  # Dependencies
  documents_bucket_name = module.storage.documents_bucket_name
  documents_bucket_arn  = module.storage.documents_bucket_arn
  documents_table_name  = module.storage.documents_table_name
  documents_table_arn   = module.storage.documents_table_arn
  vectors_bucket_name   = module.search.vectors_bucket_name
  vectors_bucket_arn    = module.search.vectors_bucket_arn
}

# API Module - REST API Gateway for document management
module "api" {
  source = "./modules/api"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Configuration

  # Dependencies
  documents_bucket_name    = module.storage.documents_bucket_name
  documents_bucket_arn     = module.storage.documents_bucket_arn
  documents_table_name     = module.storage.documents_table_name
  documents_table_arn      = module.storage.documents_table_arn
  profiles_table_name      = module.storage.profiles_table_name
  profiles_table_arn       = module.storage.profiles_table_arn
  chat_sessions_table_name = module.storage.chat_sessions_table_name
  chat_sessions_table_arn  = module.storage.chat_sessions_table_arn
  chat_messages_table_name = module.storage.chat_messages_table_name
  chat_messages_table_arn  = module.storage.chat_messages_table_arn
  processing_queue_url     = module.processing.processing_queue_url
  processing_queue_arn     = module.processing.processing_queue_arn
  user_pool_arn            = module.auth.user_pool_arn
}

# Chat Module - WebSocket API for real-time document Q&A
module "chat" {
  source = "./modules/chat"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Dependencies
  documents_table_name     = module.storage.documents_table_name
  documents_table_arn      = module.storage.documents_table_arn
  chat_sessions_table_name = module.storage.chat_sessions_table_name
  chat_sessions_table_arn  = module.storage.chat_sessions_table_arn
  chat_messages_table_name = module.storage.chat_messages_table_name
  chat_messages_table_arn  = module.storage.chat_messages_table_arn
  vectors_bucket_name      = module.search.vectors_bucket_name
  vectors_bucket_arn       = module.search.vectors_bucket_arn
  user_pool_arn            = module.auth.user_pool_arn
  user_pool_id             = module.auth.user_pool_id
  user_pool_client_id      = module.auth.user_pool_client_id
}

# Amplify Module - React frontend hosting and CI/CD
module "amplify" {
  source = "./modules/amplify"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Repository configuration
  repository_url      = var.repository_url
  github_access_token = var.github_access_token
  branch_name         = var.branch_name
  domain_name         = var.domain_name

  # Dependencies
  user_pool_id        = module.auth.user_pool_id
  user_pool_client_id = module.auth.user_pool_client_id
  identity_pool_id    = module.auth.identity_pool_id
  rest_api_url        = module.api.rest_api_url
  websocket_api_url   = module.chat.websocket_api_url
}
