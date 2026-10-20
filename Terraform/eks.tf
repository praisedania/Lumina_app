# ==========================================
# EKS Cluster IAM Role & Policies
# ==========================================
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name       = "${var.cluster_name}-cluster-role"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSVPCResourceController" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster_role.name
}

# ==========================================
# EKS Cluster Security Group
# ==========================================
resource "aws_security_group" "eks_cluster_sg" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "Cluster communication with worker nodes"
  vpc_id      = aws_vpc.lumina_vpc.id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "${var.cluster_name}-cluster-sg"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

# ==========================================
# EKS Control Plane (Cluster)
# ==========================================
resource "aws_eks_cluster" "lumina_eks" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = [aws_subnet.lumina_subnet.id, aws_subnet.lumina_subnet_az2.id]
    security_group_ids      = [aws_security_group.eks_cluster_sg.id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSVPCResourceController,
  ]

  tags = {
    Name       = var.cluster_name
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

# ==========================================
# EKS Node Group IAM Role & Policies
# ==========================================
resource "aws_iam_role" "eks_node_role" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name       = "${var.cluster_name}-node-role"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEBSCSIDriverPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.eks_node_role.name
}

# ==========================================
# EKS Managed Node Group Launch Template
# ==========================================
resource "aws_launch_template" "lumina_nodes_lt" {
  name_prefix = "${var.cluster_name}-node-lt-"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name       = "${var.cluster_name}-node"
      usage      = "lumina_app"
      managed_by = "terraform"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ==========================================
# EKS Managed Node Group
# ==========================================
resource "aws_eks_node_group" "lumina_nodes" {
  cluster_name    = aws_eks_cluster.lumina_eks.name
  node_group_name = "lumina-managed-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = [aws_subnet.lumina_subnet.id, aws_subnet.lumina_subnet_az2.id]

  instance_types = var.node_instance_types
  capacity_type  = "ON_DEMAND"

  launch_template {
    id      = aws_launch_template.lumina_nodes_lt.id
    version = "$Latest"
  }

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.node_AmazonEC2ContainerRegistryReadOnly,
  ]

  tags = {
    Name       = "${var.cluster_name}-node-group"
    usage      = "lumina_app"
    managed_by = "terraform"
  }
}

# ==========================================
# Essential EKS Addons
# ==========================================
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.lumina_eks.name
  addon_name   = "vpc-cni"
  depends_on   = [aws_eks_node_group.lumina_nodes]
}

resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.lumina_eks.name
  addon_name   = "coredns"
  depends_on   = [aws_eks_node_group.lumina_nodes]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.lumina_eks.name
  addon_name   = "kube-proxy"
  depends_on   = [aws_eks_node_group.lumina_nodes]
}

resource "aws_eks_addon" "ebs_csi" {
  cluster_name = aws_eks_cluster.lumina_eks.name
  addon_name   = "aws-ebs-csi-driver"
  depends_on   = [aws_eks_node_group.lumina_nodes]
}
