terraform {
  required_version = ">= 1.15.8" 
  backend "s3" { 
    bucket = "lumina-app-tf-state"
    key = "terraform.tfstate"
    region = "us-east-1"
    encrypt = true
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
  region = "us-east-1"
}

resource "aws_vpc" "lumina_vpc" {
  cidr_block = "10.0.0.0/16"
  instance_tenancy = "default"

  tags = {
    Name = "lumina_vpc"
    usage = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_subnet" "lumina_subnet" {
  vpc_id     = aws_vpc.lumina_vpc.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "lumina_subnet"
    usage = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_internet_gateway" "lumina_igw" {
  vpc_id = aws_vpc.lumina_vpc.id

  tags = {
    Name = "lumina_igw"
    usage = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_route_table" "lumina_rt" {
  vpc_id = aws_vpc.lumina_vpc.id

  tags = {
    Name = "lumina_rt"
    usage = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_route" "lumina_rt_igw" {
  route_table_id = aws_route_table.lumina_rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.lumina_igw.id
}


resource "aws_subnet" "lumina_subnet_az2" {
  vpc_id     = aws_vpc.lumina_vpc.id
  cidr_block = "10.0.2.0/24"

  tags = {
    Name = "lumina_subnet_az2"
    usage = "lumina_app"
    managed_by = "terraform"
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


resource "aws_security_group" "lumina_sg" {
  name        = "lumina_sg"
  description = "Security group for lumina app"
  vpc_id      = aws_vpc.lumina_vpc.id

  tags = {
    Name = "lumina_sg"
    usage = "lumina_app"
    managed_by = "terraform"
  }
}

