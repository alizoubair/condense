# This file configures the AWS provider with default tags and regional settings.
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}