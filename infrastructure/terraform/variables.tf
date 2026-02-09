variable "project_id" {
  description = "The GCP project ID"
}

variable "region" {
  default = "us-central1"
}

variable "project_name" {
  default = "microservice-gitops-cloud"
}

variable "db_password" {
  sensitive = true
}

variable "use_gcp" {
  description = "Whether to use GCP resources (true) or local Docker (false)"
  type        = bool
  default     = false
}
