# SQS Queue for document processing
resource "aws_sqs_queue" "document_processing" {
  name                       = "${var.project_name}-${var.environment}-document-processing"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 1209600
  receive_wait_time_seconds  = 0
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.document_processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.common_tags
}

resource "aws_sqs_queue" "document_processing_dlq" {
  name = "${var.project_name}-${var.environment}-document-processing-dlq"
  tags = var.common_tags
}

# Step Functions State Machine
resource "aws_sfn_state_machine" "document_processing" {
  name     = "${var.project_name}-${var.environment}-document-processing"
  role_arn = aws_iam_role.step_functions_role.arn

  definition = jsonencode({
    Comment = "Document processing workflow with text extraction, embedding, and summarization"
    StartAt = "UpdateStatusProcessing"
    States = {
      UpdateStatusProcessing = {
        Type     = "Task"
        Resource = aws_lambda_function.update_status.arn
        Parameters = {
          "document_id.$" = "$.document_id"
          "status"        = "processing"
          "step"          = "started"
        }
        Next = "ExtractText"
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 2
            MaxAttempts     = 3
            BackoffRate     = 2.0
          }
        ]
      }

      ExtractText = {
        Type     = "Task"
        Resource = aws_lambda_function.text_extractor.arn
        Parameters = {
          "document_id.$" = "$.document_id"
          "s3_bucket.$"   = "$.updated_document.s3_bucket"
          "s3_key.$"      = "$.updated_document.s3_key"
          "file_type.$"   = "$.updated_document.file_type"
          "user_id.$"     = "$.updated_document.user_id"
        }
        Next = "ChunkText"
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 5
            MaxAttempts     = 3
            BackoffRate     = 2.0
          }
        ]
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            Next        = "UpdateStatusFailed"
            ResultPath  = "$.error"
          }
        ]
      }

      ChunkText = {
        Type     = "Task"
        Resource = aws_lambda_function.text_chunker.arn
        Parameters = {
          "document_id.$"    = "$.document_id"
          "extracted_text.$" = "$.extracted_text"
        }
        Next = "ParallelProcessing"
        Retry = [
          {
            ErrorEquals     = ["States.TaskFailed"]
            IntervalSeconds = 2
            MaxAttempts     = 3
            BackoffRate     = 2.0
          }
        ]
      }

      ParallelProcessing = {
        Type = "Parallel"
        Branches = [
          {
            StartAt = "GenerateEmbeddings"
            States = {
              GenerateEmbeddings = {
                Type     = "Task"
                Resource = aws_lambda_function.embeddings_generator.arn
                Parameters = {
                  "document_id.$" = "$.document_id"
                  "text_chunks.$" = "$.text_chunks"
                }
                End = true
                Retry = [
                  {
                    ErrorEquals     = ["States.TaskFailed"]
                    IntervalSeconds = 10
                    MaxAttempts     = 3
                    BackoffRate     = 2.0
                  }
                ]
              }
            }
          },
          {
            StartAt = "GenerateSummary"
            States = {
              GenerateSummary = {
                Type     = "Task"
                Resource = aws_lambda_function.summarizer.arn
                Parameters = {
                  "document_id.$"    = "$.document_id"
                  "extracted_text.$" = "$.extracted_text"
                }
                End = true
                Retry = [
                  {
                    ErrorEquals     = ["States.TaskFailed"]
                    IntervalSeconds = 10
                    MaxAttempts     = 3
                    BackoffRate     = 2.0
                  }
                ]
              }
            }
          }
        ]
        Next = "UpdateStatusCompleted"
        Catch = [
          {
            ErrorEquals = ["States.ALL"]
            Next        = "UpdateStatusFailed"
            ResultPath  = "$.error"
          }
        ]
      }

      UpdateStatusCompleted = {
        Type     = "Task"
        Resource = aws_lambda_function.update_status.arn
        Parameters = {
          "document_id.$"       = "$[0].document_id"
          "status"              = "completed"
          "step"                = "finished"
          "summary.$"           = "$[1].summary"
          "embeddings_stored.$" = "$[0].embeddings_stored"
        }
        End = true
      }

      UpdateStatusFailed = {
        Type     = "Task"
        Resource = aws_lambda_function.update_status.arn
        Parameters = {
          "document_id.$" = "$.document_id"
          "status"        = "failed"
          "error.$"       = "$.error"
        }
        End = true
      }
    }
  })

  tags = var.common_tags
}

# Lambda Functions for Step Functions
# 1. Text Extractor Lambda
resource "aws_lambda_function" "text_extractor" {
  filename         = "${path.root}/../lambda/packages/text-extractor.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/text-extractor.zip")
  function_name    = "${var.project_name}-${var.environment}-text-extractor"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      DOCUMENTS_TABLE = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# 2. Text Chunker Lambda
resource "aws_lambda_function" "text_chunker" {
  filename         = "${path.root}/../lambda/packages/text-chunker.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/text-chunker.zip")
  function_name    = "${var.project_name}-${var.environment}-text-chunker"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  tags = var.common_tags
}

# 3. Embeddings Generator Lambda
resource "aws_lambda_function" "embeddings_generator" {
  filename         = "${path.root}/../lambda/packages/embeddings-generator.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/embeddings-generator.zip")
  function_name    = "${var.project_name}-${var.environment}-embeddings-generator"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      VECTORS_BUCKET_NAME = var.vectors_bucket_name
      DOCUMENTS_TABLE     = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# 4. Summarizer Lambda
resource "aws_lambda_function" "summarizer" {
  filename         = "${path.root}/../lambda/packages/summarizer.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/summarizer.zip")
  function_name    = "${var.project_name}-${var.environment}-summarizer"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      DOCUMENTS_TABLE = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# 5. Status Updater Lambda
resource "aws_lambda_function" "update_status" {
  filename         = "${path.root}/../lambda/packages/status-updater.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/status-updater.zip")
  function_name    = "${var.project_name}-${var.environment}-status-updater"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      DOCUMENTS_TABLE = var.documents_table_name
    }
  }

  tags = var.common_tags
}

# SQS to Step Functions trigger
resource "aws_lambda_function" "sqs_processor" {
  filename         = "${path.root}/../lambda/packages/sqs-processor.zip"
  source_code_hash = filebase64sha256("${path.root}/../lambda/packages/sqs-processor.zip")
  function_name    = "${var.project_name}-${var.environment}-sqs-processor"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  environment {
    variables = {
      STEP_FUNCTION_ARN = aws_sfn_state_machine.document_processing.arn
    }
  }

  tags = var.common_tags
}

# SQS trigger for Lambda
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.document_processing.arn
  function_name    = aws_lambda_function.sqs_processor.arn
  batch_size       = 1
}
