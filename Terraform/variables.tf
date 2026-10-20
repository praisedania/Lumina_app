variable "aws_region" {
  type        = string
  description = "AWS Region"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR Block"
  default     = "10.0.0.0/16"
}

variable "instance_tenancy" {
  type        = string
  description = "Instance tenancy"
  default     = "default"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
  default     = "lumina-eks-cluster"
}

variable "kubernetes_version" {
  type        = string
  description = "Desired Kubernetes version for EKS"
  default     = "1.31"
}

variable "node_instance_types" {
  type        = list(string)
  description = "EC2 instance types for EKS managed node group"
  default     = ["t3.medium"]
}

variable "desired_nodes" {
  type        = number
  description = "Desired number of worker nodes"
  default     = 2
}

variable "min_nodes" {
  type        = number
  description = "Minimum number of worker nodes"
  default     = 1
}

variable "max_nodes" {
  type        = number
  description = "Maximum number of worker nodes"
  default     = 4
}