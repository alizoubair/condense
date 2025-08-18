# S3 Buckets
resource "aws_s3_bucket" "documents" {
  bucket = "${var.project_name}-${var.environment}-documents-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = var.common_tags
}

resource "aws_s3_bucket" "processed_documents" {
  bucket = "${var.project_name}-${var.environment}-processed-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = var.common_tags
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB Tables
resource "aws_dynamodb_table" "documents" {
  name         = "${var.project_name}-${var.environment}-documents"
  billing_mode = var.billing_mode
  hash_key     = "document_id"

  attribute {
    name = "document_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

resource "aws_dynamodb_table" "chat_sessions" {
  name         = "${var.project_name}-${var.environment}-chat-sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "session_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-sessions-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

resource "aws_dynamodb_table" "profiles" {
  name         = "${var.project_name}-${var.environment}-profiles"
  billing_mode = var.billing_mode
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = var.common_tags
}

resource "aws_dynamodb_table" "chat_messages" {
  name         = "${var.project_name}-${var.environment}-chat-messages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "document_id"
  range_key    = "timestamp"

  attribute {
    name = "document_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-messages-index"
    hash_key        = "user_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = var.common_tags
}