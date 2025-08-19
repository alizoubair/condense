output "processing_queue_url" {
  description = "URL of the document processing SQS queue"
  value       = aws_sqs_queue.document_processing.url
}

output "processing_queue_arn" {
  description = "ARN of the document processing SQS queue"
  value       = aws_sqs_queue.document_processing.arn
}

output "step_function_arn" {
  description = "ARN of the document processing Step Function"
  value       = aws_sfn_state_machine.document_processing.arn
}

output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "bedrock_logging_role_arn" {
  description = "ARN of the Bedrock logging IAM role"
  value       = aws_iam_role.bedrock_logging_role.arn
}

output "bedrock_log_group_name" {
  description = "Name of the Bedrock CloudWatch log group"
  value       = aws_cloudwatch_log_group.bedrock_model_invocation.name
}