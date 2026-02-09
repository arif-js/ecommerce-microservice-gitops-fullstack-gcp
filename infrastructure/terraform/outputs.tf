# infrastructure/terraform/outputs.tf

output "database_url" {
  description = "The connection string for the database"
  value       = var.use_gcp ? "postgresql://postgres:${var.db_password}@${google_sql_database_instance.db_cloud[0].public_ip_address}:5432/${google_sql_database.database[0].name}" : "postgresql://postgres:${var.db_password}@localhost:5432/postgres"
  sensitive   = true
}

output "gke_cluster_name" {
  description = "GKE Cluster Name"
  value       = var.use_gcp ? module.gke[0].cluster_name : "local"
}

output "gke_region" {
  description = "GKE Region"
  value       = var.region
}
