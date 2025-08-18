output "websocket_api_url" {
  description = "WebSocket API URL"
  value       = "wss://${aws_apigatewayv2_api.chat.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "websocket_api_id" {
  description = "WebSocket API ID"
  value       = aws_apigatewayv2_api.chat.id
}

output "websocket_api_arn" {
  description = "WebSocket API ARN"
  value       = aws_apigatewayv2_api.chat.arn
}