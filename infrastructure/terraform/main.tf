terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "google" {
  project      = "unused" # Inert project for default provider
  access_token = "dummy"  # Inert access token for default provider
}

provider "google" {
  alias        = "gcp"
  project      = var.use_gcp ? var.project_id : "unused" # Conditional project for aliased provider
  region       = var.use_gcp ? var.region : null         # Conditional region for aliased provider
  access_token = var.use_gcp ? null : "dummy"            # Conditional access token for aliased provider
}

provider "docker" {}

module "vpc" {
  count  = var.use_gcp ? 1 : 0
  source = "./modules/vpc"
  
  providers = {
    google = google.gcp
  }
  
  network_name = "${var.project_name}-vpc"
  region       = var.region
}

# module "sql" is now handled by root/sql.tf as per user request

module "gke" {
  count  = var.use_gcp ? 1 : 0
  source = "./modules/gke"
  
  providers = {
    google = google.gcp
  }
  
  network_id   = var.use_gcp ? module.vpc[0].network_id : ""
  subnet_id    = var.use_gcp ? module.vpc[0].subnet_id : ""
  cluster_name = "${var.project_name}-gke"
  region       = var.region
}
