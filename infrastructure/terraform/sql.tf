# infrastructure/terraform/sql.tf

# 1. LOCAL: Docker Postgres (Free)
resource "docker_container" "db_local" {
  count = var.use_gcp ? 0 : 1
  name  = "local-postgres"
  image = "postgres:15-alpine"
  env   = ["POSTGRES_PASSWORD=${var.db_password}"]
  ports {
    internal = 5432
    external = 5432
  }
}

# 2. CLOUD: GCP Cloud SQL (Using $300 Credit)
resource "google_sql_database_instance" "db_cloud" {
  count            = var.use_gcp ? 1 : 0
  name             = "microservice-gitops-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro" # Smallest tier to save credit
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

resource "google_sql_database" "database" {
  count    = var.use_gcp ? 1 : 0
  name     = "microservice_gitops_db"
  instance = google_sql_database_instance.db_cloud[0].name
}

resource "google_sql_user" "users" {
  count    = var.use_gcp ? 1 : 0
  name     = "postgres"
  instance = google_sql_database_instance.db_cloud[0].name
  password = var.db_password
}
