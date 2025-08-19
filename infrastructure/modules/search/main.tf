# S3 bucket for vector storage
resource "aws_s3_bucket" "vectors" {
  bucket        = "${var.project_name}-${var.environment}-vectors-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = var.common_tags
}

# Random suffix for bucket name uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "vectors" {
  bucket = aws_s3_bucket.vectors.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "vectors" {
  bucket = aws_s3_bucket.vectors.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "vectors" {
  bucket = aws_s3_bucket.vectors.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
