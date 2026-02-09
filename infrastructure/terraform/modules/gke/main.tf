terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  enable_autopilot = true
  network          = var.network_id
  subnetwork       = var.subnet_id

  # Autopilot clusters require a specific release channel
  release_channel {
    channel = "REGULAR"
  }
}

variable "network_id" {}
variable "subnet_id" {}
variable "cluster_name" {}
variable "region" {}
