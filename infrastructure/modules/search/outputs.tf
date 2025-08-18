output "vectors_bucket_name" {
  description = "S3 bucket name for vector storage"
  value       = aws_s3_bucket.vectors.bucket
}

output "vectors_bucket_arn" {
  description = "S3 bucket ARN for vector storage"
  value       = aws_s3_bucket.vectors.arn
}