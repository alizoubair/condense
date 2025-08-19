# REST API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "REST API for document management"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.common_tags
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration.upload_document,
    aws_api_gateway_integration.get_documents,
    aws_api_gateway_integration.get_document,
    aws_api_gateway_integration.delete_document,
    aws_api_gateway_integration.get_document_status,
    aws_api_gateway_integration.get_profile,
    aws_api_gateway_integration.update_profile,
    aws_api_gateway_integration.create_profile,
    aws_api_gateway_integration.get_chat_history_new,
    aws_api_gateway_integration.documents_options,
    aws_api_gateway_integration.document_options,
    aws_api_gateway_integration.document_status_options,
    aws_api_gateway_integration.profile_options,
    aws_api_gateway_integration.chat_history_options,
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.environment

  # Force redeployment when methods change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_integration.upload_document.id,
      aws_api_gateway_integration.get_documents.id,
      aws_api_gateway_integration.get_document.id,
      aws_api_gateway_integration.delete_document.id,
      aws_api_gateway_integration.get_document_status.id,
      aws_api_gateway_integration.get_profile.id,
      aws_api_gateway_integration.update_profile.id,
      aws_api_gateway_integration.create_profile.id,
      aws_api_gateway_integration.get_chat_history_new.id,
      aws_api_gateway_integration.documents_options.id,
      aws_api_gateway_integration.document_options.id,
      aws_api_gateway_integration.document_status_options.id,
      aws_api_gateway_integration.profile_options.id,
      aws_api_gateway_integration.chat_history_options.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# CORS Configuration
resource "aws_api_gateway_gateway_response" "cors" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = jsonencode({
      message = "$context.error.messageString"
    })
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
  }
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${var.project_name}-${var.environment}-authorizer"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [var.user_pool_arn]
}

# /documents resource
resource "aws_api_gateway_resource" "documents" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "documents"
}

# /documents/{id} resource
resource "aws_api_gateway_resource" "document" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.documents.id
  path_part   = "{id}"
}

# /documents/{id}/status resource
resource "aws_api_gateway_resource" "document_status" {
  rest_api_id = aws_api_gateway_resource.document.rest_api_id
  parent_id   = aws_api_gateway_resource.document.id
  path_part   = "status"
}

# /profile resource
resource "aws_api_gateway_resource" "profile" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "profile"
}

# /user resource
resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "user"
}

# /user/stats resource
resource "aws_api_gateway_resource" "user_stats" {
  rest_api_id = aws_api_gateway_resource.user.rest_api_id
  parent_id   = aws_api_gateway_resource.user.id
  path_part   = "stats"
}

# /chat resource
resource "aws_api_gateway_resource" "chat" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "chat"
}

# /chat/history resource
resource "aws_api_gateway_resource" "chat_history" {
  rest_api_id = aws_api_gateway_resource.chat.rest_api_id
  parent_id   = aws_api_gateway_resource.chat.id
  path_part   = "history"
}

# /chat/history/{id} resource
resource "aws_api_gateway_resource" "chat_history_id" {
  rest_api_id = aws_api_gateway_resource.chat_history.rest_api_id
  parent_id   = aws_api_gateway_resource.chat_history.id
  path_part   = "{id}"
}

# Lambda Functions for API endpoints
# Document Upload Handler
resource "aws_lambda_function" "upload_handler" {
  filename         = "${path.root}/../lambda/packages/upload-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/upload-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-upload-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "upload-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DOCUMENTS_BUCKET = var.documents_bucket_name
      DOCUMENTS_TABLE  = var.documents_table_name
      PROCESSING_QUEUE = var.processing_queue_url
      NODE_ENV         = var.environment
    }
  }

  tags = var.common_tags
}

# Document List Handler
resource "aws_lambda_function" "list_handler" {
  filename         = "${path.root}/../lambda/packages/list-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/list-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-list-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "list-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DOCUMENTS_TABLE = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# Document Get Handler
resource "aws_lambda_function" "get_handler" {
  filename         = "${path.root}/../lambda/packages/get-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/get-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-get-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "get-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DOCUMENTS_TABLE  = var.documents_table_name
      DOCUMENTS_BUCKET = var.documents_bucket_name
    }
  }

  tags = var.common_tags
}

# Document Delete Handler
resource "aws_lambda_function" "delete_handler" {
  filename         = "${path.root}/../lambda/packages/delete-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/delete-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-delete-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "delete-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DOCUMENTS_TABLE  = var.documents_table_name
      DOCUMENTS_BUCKET = var.documents_bucket_name
    }
  }

  tags = var.common_tags
}

# Document Status Handler
resource "aws_lambda_function" "status_handler" {
  filename         = "${path.root}/../lambda/packages/status-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/status-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-status-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "status-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DOCUMENTS_TABLE = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# Profile Handler
resource "aws_lambda_function" "profile_handler" {
  filename         = "${path.root}/../lambda/packages/profile-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/profile-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-profile-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "profile-handler/index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      PROFILES_TABLE = var.profiles_table_name
    }
  }

  tags = var.common_tags
}

# Chat History Handler
resource "aws_lambda_function" "chat_history_handler" {
  filename         = "${path.root}/../lambda/packages/chat-history-handler.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-history-handler.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-history-handler"
  role             = aws_iam_role.api_lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      CHAT_MESSAGES_TABLE = var.chat_messages_table_name
    }
  }

  tags = var.common_tags
}

# Additional CORS Gateway Responses

# CORS Configuration for Unauthorized (401)
resource "aws_api_gateway_gateway_response" "cors_unauthorized" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "UNAUTHORIZED"

  response_templates = {
    "application/json" = jsonencode({
      message = "Unauthorized"
    })
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
  }
}

# CORS Configuration for Access Denied (403)
resource "aws_api_gateway_gateway_response" "cors_access_denied" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "ACCESS_DENIED"

  response_templates = {
    "application/json" = jsonencode({
      message = "Access Denied"
    })
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
  }
}

# CORS Configuration for Rate Limiting (429)
resource "aws_api_gateway_gateway_response" "cors_throttled" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "THROTTLED"

  response_templates = {
    "application/json" = jsonencode({
      message = "Too Many Requests"
    })
  }

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
  }
}

