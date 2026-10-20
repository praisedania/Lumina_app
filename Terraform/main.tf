terraform {
  required_version = ">= 1.10.0"
  backend "s3" {
    bucket       = "lumina-app-tf-state"
    key          = "terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==========================================
# VPC Configuration
# ==========================================
resource "aws_vpc" "lumina_vpc" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = var.instance_tenancy
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                        = "lumina_vpc"
    usage                                       = "lumina_app"
    managed_by                                  = "terraform"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# ==========================================
# Internet Gateway & Routing
# ==========================================
resource "aws_internet_gateway" "lumina_igw" {
  vpc_id = aws_vpc.lumina_vpc.id

  tags = {
    Name       = "lumina_igw"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_route_table" "lumina_rt" {
  vpc_id = aws_vpc.lumina_vpc.id

  tags = {
    Name       = "lumina_rt"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_route" "lumina_rt_igw" {
  route_table_id         = aws_route_table.lumina_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.lumina_igw.id
}

# ==========================================
# Subnets (Spanning 2 AZs for EKS High Availability)
# ==========================================
resource "aws_subnet" "lumina_subnet" {
  vpc_id                  = aws_vpc.lumina_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "lumina_subnet_az1"
    usage                                       = "lumina_app"
    managed_by                                  = "terraform"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_subnet" "lumina_subnet_az2" {
  vpc_id                  = aws_vpc.lumina_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "lumina_subnet_az2"
    usage                                       = "lumina_app"
    managed_by                                  = "terraform"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_route_table_association" "lumina_rt_association" {
  subnet_id      = aws_subnet.lumina_subnet.id
  route_table_id = aws_route_table.lumina_rt.id
}

resource "aws_route_table_association" "lumina_rt_association_az2" {
  subnet_id      = aws_subnet.lumina_subnet_az2.id
  route_table_id = aws_route_table.lumina_rt.id
}

# ==========================================
# Security Groups
# ==========================================
resource "aws_security_group" "lumina_sg" {
  name        = "lumina_sg"
  description = "Security group for Lumina application traffic"
  vpc_id      = aws_vpc.lumina_vpc.id

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow NodePort / App traffic"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow Backend API traffic"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "lumina_sg"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}
