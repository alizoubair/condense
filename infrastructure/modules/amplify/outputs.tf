output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.main.id
}

output "amplify_app_arn" {
  description = "Amplify App ARN"
  value       = aws_amplify_app.main.arn
}

output "amplify_default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.main.default_domain
}

output "amplify_app_url" {
  description = "Amplify app URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.domain_name != null ? "https://${var.environment == "prod" ? "" : "${var.environment}."}${var.domain_name}" : null
}