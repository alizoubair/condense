# CloudWatch Log Group for Bedrock Model Invocation Logging
resource "aws_cloudwatch_log_group" "bedrock_model_invocation" {
  name              = "/aws/bedrock/modelinvocations"
  retention_in_days = 14
  tags              = var.common_tags
}

# IAM Role for Bedrock Logging
resource "aws_iam_role" "bedrock_logging_role" {
  name = "${var.project_name}-${var.environment}-bedrock-logging-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# IAM Policy for Bedrock to write to CloudWatch Logs
resource "aws_iam_role_policy" "bedrock_logging_policy" {
  name = "${var.project_name}-${var.environment}-bedrock-logging-policy"
  role = aws_iam_role.bedrock_logging_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.bedrock_model_invocation.arn}:*"
      }
    ]
  })
}

# Bedrock Model Invocation Logging Configuration
resource "aws_bedrock_model_invocation_logging_configuration" "main" {
  logging_config {
    cloudwatch_config {
      log_group_name = aws_cloudwatch_log_group.bedrock_model_invocation.name
      role_arn       = aws_iam_role.bedrock_logging_role.arn
    }
    embedding_data_delivery_enabled = true
    image_data_delivery_enabled     = false
    text_data_delivery_enabled      = true
  }
}