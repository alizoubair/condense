# WebSocket API Gateway
resource "aws_apigatewayv2_api" "chat" {
  name                       = "${var.project_name}-${var.environment}-chat"
  protocol_type             = "WEBSOCKET"
  route_selection_expression = "$request.body.action"

  tags = var.common_tags
}

# WebSocket API Stage
resource "aws_apigatewayv2_stage" "chat" {
  api_id      = aws_apigatewayv2_api.chat.id
  name        = var.environment
  auto_deploy = true

  default_route_settings {
    data_trace_enabled       = true
    detailed_metrics_enabled = true
    logging_level           = "INFO"
    throttling_burst_limit  = 100
    throttling_rate_limit   = 50
  }

  tags = var.common_tags
}

# Lambda Functions for WebSocket handlers
# Connection Handler
resource "aws_lambda_function" "connect_handler" {
  filename         = "${path.root}/../lambda/packages/chat-connect.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-connect.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-connect"
  role            = aws_iam_role.chat_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      CHAT_SESSIONS_TABLE = var.chat_sessions_table_name
    }
  }

  tags = var.common_tags
}

# Disconnect Handler
resource "aws_lambda_function" "disconnect_handler" {
  filename         = "${path.root}/../lambda/packages/chat-disconnect.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-disconnect.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-disconnect"
  role            = aws_iam_role.chat_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      CHAT_SESSIONS_TABLE = var.chat_sessions_table_name
    }
  }

  tags = var.common_tags
}

# Message Handler
resource "aws_lambda_function" "message_handler" {
  filename         = "${path.root}/../lambda/packages/chat-message.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-message.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-message"
  role            = aws_iam_role.chat_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 300
  memory_size     = 1024

  environment {
    variables = {
      CHAT_SESSIONS_TABLE    = var.chat_sessions_table_name
      CHAT_MESSAGES_TABLE    = var.chat_messages_table_name
      DOCUMENTS_TABLE        = var.documents_table_name
      VECTORS_BUCKET_NAME    = var.vectors_bucket_name
      WEBSOCKET_API_ENDPOINT = "https://${aws_apigatewayv2_api.chat.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
    }
  }

  tags = var.common_tags
}

# Default Handler (for unmatched routes)
resource "aws_lambda_function" "default_handler" {
  filename         = "${path.root}/../lambda/packages/chat-default.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-default.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-default"
  role            = aws_iam_role.chat_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  tags = var.common_tags
}

# Authorizer Handler
resource "aws_lambda_function" "authorizer_handler" {
  filename         = "${path.root}/../lambda/packages/chat-authorizer.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/chat-authorizer.zip")
  function_name    = "${var.project_name}-${var.environment}-chat-authorizer"
  role            = aws_iam_role.chat_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      USER_POOL_ID        = var.user_pool_id
      USER_POOL_CLIENT_ID = var.user_pool_client_id
    }
  }

  tags = var.common_tags
}

resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

# Custom Authorizer
resource "aws_apigatewayv2_authorizer" "chat_authorizer" {
  api_id           = aws_apigatewayv2_api.chat.id
  authorizer_type  = "REQUEST"
  authorizer_uri   = aws_lambda_function.authorizer_handler.invoke_arn
  name             = "${var.project_name}-${var.environment}-chat-authorizer"
  identity_sources = ["route.request.querystring.token"]
}

# WebSocket Routes

# $connect route
resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.connect.id}"

  authorization_type = "CUSTOM"
  authorizer_id     = aws_apigatewayv2_authorizer.chat_authorizer.id
}

resource "aws_apigatewayv2_integration" "connect" {
  api_id           = aws_apigatewayv2_api.chat.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.connect_handler.invoke_arn
}

resource "aws_lambda_permission" "connect" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.connect_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

# $disconnect route
resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.disconnect.id}"
}

resource "aws_apigatewayv2_integration" "disconnect" {
  api_id           = aws_apigatewayv2_api.chat.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.disconnect_handler.invoke_arn
}

resource "aws_lambda_permission" "disconnect" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.disconnect_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

# sendMessage route
resource "aws_apigatewayv2_route" "send_message" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "sendMessage"
  target    = "integrations/${aws_apigatewayv2_integration.send_message.id}"
}

resource "aws_apigatewayv2_integration" "send_message" {
  api_id           = aws_apigatewayv2_api.chat.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.message_handler.invoke_arn
}

resource "aws_lambda_permission" "send_message" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.message_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

# $default route
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.default.id}"
}

resource "aws_apigatewayv2_integration" "default" {
  api_id           = aws_apigatewayv2_api.chat.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.default_handler.invoke_arn
}

resource "aws_lambda_permission" "default" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.default_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.chat.execution_arn}/*/*"
}

data "aws_region" "current" {}