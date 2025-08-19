# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  # Common tags applied to all resources
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  # Naming conventions
  name_prefix = "${var.project_name}-${var.environment}"

  # Resource naming
  resource_names = {
    # Storage
    documents_bucket           = "${local.name_prefix}-documents"
    processed_documents_bucket = "${local.name_prefix}-processed"
    documents_table            = "${local.name_prefix}-documents"
    chat_sessions_table        = "${local.name_prefix}-chat-sessions"

    # Processing
    processing_queue = "${local.name_prefix}-processing"
    processing_dlq   = "${local.name_prefix}-processing-dlq"
    step_function    = "${local.name_prefix}-document-processing"

    # APIs
    rest_api      = "${local.name_prefix}-api"
    websocket_api = "${local.name_prefix}-chat"

    # Auth
    user_pool        = "${local.name_prefix}-users"
    user_pool_client = "${local.name_prefix}-client"
    identity_pool    = "${local.name_prefix}-identity"

    # Amplify
    amplify_app = local.name_prefix
  }

  # Configuration values
  config = {
    # Lambda defaults
    lambda_runtime = "nodejs20.x"
    lambda_timeout = var.lambda_timeout
    lambda_memory  = var.lambda_memory_size

    # API Gateway configuration
    api_stage_name = var.environment

    # S3 configuration
    s3_versioning_enabled = var.environment == "prod"

    # DynamoDB configuration
    dynamodb_billing_mode = var.dynamodb_billing_mode

    # Security configuration
    cors_allowed_origins = var.allowed_origins
  }

  # Feature flags
  features = {
    custom_domain = var.enable_custom_domain && var.domain_name != null
    monitoring    = var.enable_monitoring
    backup        = var.enable_backup
    waf           = var.enable_waf
  }
}