# Amplify App
resource "aws_amplify_app" "main" {
  name         = "${var.project_name}-${var.environment}"
  repository   = var.repository_url
  access_token = var.github_access_token

  # Build settings
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd amplify
            - npm install
        build:
          commands:
            - npm run build
        postBuild:
          commands:
            - echo "Build completed successfully"
      artifacts:
        baseDirectory: amplify/build
        files:
          - '**/*'
      cache:
        paths:
          - amplify/node_modules/**/*
  EOT

  # Environment variables
  environment_variables = {
    REACT_APP_AWS_REGION          = data.aws_region.current.name
    REACT_APP_USER_POOL_ID        = var.user_pool_id
    REACT_APP_USER_POOL_CLIENT_ID = var.user_pool_client_id
    REACT_APP_IDENTITY_POOL_ID    = var.identity_pool_id
    REACT_APP_API_URL             = var.rest_api_url
    REACT_APP_WEBSOCKET_URL       = var.websocket_api_url
  }

  # Enable auto branch creation for feature branches only
  enable_auto_branch_creation   = true
  auto_branch_creation_patterns = ["feature/*", "hotfix/*"]

  # Custom rules for SPA
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  tags = var.common_tags
}

# Main branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.branch_name

  framework = "React"
  stage     = "PRODUCTION"

  environment_variables = {
    REACT_APP_AWS_REGION          = data.aws_region.current.name
    REACT_APP_USER_POOL_ID        = var.user_pool_id
    REACT_APP_USER_POOL_CLIENT_ID = var.user_pool_client_id
    REACT_APP_IDENTITY_POOL_ID    = var.identity_pool_id
    REACT_APP_API_URL             = var.rest_api_url
    REACT_APP_WEBSOCKET_URL       = var.websocket_api_url
  }

  tags = var.common_tags
}

# Domain association (optional)
resource "aws_amplify_domain_association" "main" {
  count       = var.domain_name != null ? 1 : 0
  app_id      = aws_amplify_app.main.id
  domain_name = var.domain_name

  # Subdomain configuration
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.environment == "prod" ? "" : var.environment
  }

  # Wait for certificate validation
  wait_for_verification = true
}

data "aws_region" "current" {}
