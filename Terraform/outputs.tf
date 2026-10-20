output "cluster_id" {
  description = "The ID of the EKS cluster"
  value       = aws_eks_cluster.lumina_eks.id
}

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.lumina_eks.name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.lumina_eks.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_security_group.eks_cluster_sg.id
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.lumina_eks.certificate_authority[0].data
  sensitive   = true
}

output "configure_kubectl" {
  description = "Run this command to configure kubectl with the new EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.lumina_eks.name}"
}
