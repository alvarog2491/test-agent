# Versioning Strategy

This document describes the production-grade versioning and tagging strategy implemented for the Enterprise Bedrock Agent project, following AWS best practices for traceability, lineage, and rollback capabilities.

## Overview

The project implements comprehensive versioning across all infrastructure components:
- **Infrastructure Code**: Semantic versioning in `package.json`
- **Lambda Functions**: Published versions with environment-based aliases
- **Bedrock Agent**: Numbered versions with environment-based aliases
- **S3 Objects**: Object versioning with lifecycle management
- **Resource Tagging**: Version, git commit, and deployment timestamp tags on all resources

## Version Management

### Semantic Versioning

The project uses [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH) tracked in `package.json`:
- **MAJOR**: Breaking changes or significant architectural updates
- **MINOR**: New features or enhancements (backward compatible)
- **PATCH**: Bug fixes and minor improvements

### Bumping Versions

Use the provided npm scripts to bump versions:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:major
```

These scripts will:
1. Update the version in `package.json`
2. Create a git commit with the version bump
3. Create a git tag (e.g., `v1.0.1`)

**Important**: Always push both the commit and the tag:
```bash
git push
git push origin v1.0.1
```

## Resource Versioning

### Lambda Functions

Lambda functions are automatically versioned on each deployment:
- **Version**: A new immutable version is published on each deployment
- **Alias**: Environment-based alias (dev/staging/prod) points to the latest version
- **Rollback**: Update the alias to point to a previous version

Example:
```
Lead Collection Function
├── Version 1 (initial deployment)
├── Version 2 (bug fix)
├── Version 3 (new feature)
└── Alias "prod" → Version 3
```

### Bedrock Agent

Bedrock agents use a similar versioning strategy:
- **DRAFT**: Working version for development
- **Numbered Versions**: Created on each deployment (1, 2, 3, ...)
- **Alias**: Environment-based alias points to a specific version
- **Rollback**: Update the alias to point to a previous version

### S3 Buckets

S3 buckets have versioning enabled with lifecycle policies:
- **Knowledge Base Bucket**: Versioned, tracks all document changes
- **Evaluations Bucket**: Versioned, tracks all evaluation results
- **Lifecycle Policy**:
  - Keep last 5 noncurrent versions
  - Delete noncurrent versions after 90 days
  - Remove expired delete markers

## Tagging Strategy

All resources are tagged with comprehensive metadata for traceability:

### Standard Tags

| Tag Key | Description | Example |
|---------|-------------|---------|
| `Version` | Application version from package.json | `1.0.0` |
| `GitCommitSHA` | Short git commit SHA | `a1b2c3d` |
| `DeploymentTimestamp` | ISO 8601 timestamp of deployment | `2026-01-31T17:00:00Z` |
| `Environment` | Deployment environment | `prod` |
| `AppName` | Application name | `Enterprise-Bedrock-Agent` |
| `ManagedBy` | Infrastructure management tool | `AWS-CDK` |
| `Project` | Project identifier | `Enterprise-Bedrock-Agent` |

### Resource-Specific Tags

- **Storage Resources** (S3, DynamoDB): `Purpose`, `DataClassification`, `ResourceType`
- **Compute Resources** (Lambda, Bedrock): `Purpose`, `ResourceType`
- **Interface Resources** (API Gateway): `Purpose`, `ResourceType`
- **Monitoring Resources** (CloudWatch): `Purpose`, `ResourceType`

## Deployment Process

### Standard Deployment

1. **Bump Version** (if needed):
   ```bash
   npm run version:patch
   ```

2. **Push Changes**:
   ```bash
   git push
   git push origin v1.0.1
   ```

3. **CI/CD Deployment**:
   - GitHub Actions automatically deploys on push to `main`
   - Extracts version from `package.json`
   - Extracts git commit SHA
   - Tags all CloudFormation stacks with version metadata
   - Stores deployment metadata as artifact

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to specific environment
npx cdk deploy --all -c env=prod
```

## Rollback Procedures

### Automated Rollback (via GitHub Actions)

1. Go to **Actions** → **Rollback Bedrock Agent**
2. Click **Run workflow**
3. Select:
   - **Target Version**: Version to rollback to (e.g., `1.0.0`)
   - **Environment**: Environment to rollback (`dev`, `staging`, or `prod`)
4. Click **Run workflow**

The workflow will:
- Validate the target version exists
- Checkout the target version code
- Deploy the previous version
- Tag the deployment with rollback metadata

### Manual Rollback

#### Option 1: Checkout Previous Version

```bash
# List available versions
git tag

# Checkout target version
git checkout v1.0.0

# Deploy
npx cdk deploy --all -c env=prod
```

#### Option 2: Update Aliases (Faster)

For quick rollbacks without full redeployment:

**Lambda Functions**:
```bash
# List versions
aws lambda list-versions-by-function --function-name <function-name>

# Update alias to point to previous version
aws lambda update-alias \
  --function-name <function-name> \
  --name prod \
  --function-version 2
```

**Bedrock Agent**:
```bash
# List agent versions
aws bedrock-agent list-agent-versions --agent-id <agent-id>

# Update alias
aws bedrock-agent update-agent-alias \
  --agent-id <agent-id> \
  --agent-alias-id <alias-id> \
  --agent-version "2"
```

## Resource Lineage and Traceability

### Finding Resources by Version

Use AWS Resource Groups to query resources by version tag:

```bash
# Find all resources from version 1.0.0
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Version,Values=1.0.0
```

### Tracking Data Lineage

**S3 Objects**:
```bash
# List all versions of an object
aws s3api list-object-versions \
  --bucket <bucket-name> \
  --prefix <object-key>

# Retrieve specific version
aws s3api get-object \
  --bucket <bucket-name> \
  --key <object-key> \
  --version-id <version-id> \
  output.txt
```

**Lambda Function Code**:
```bash
# Get function configuration for specific version
aws lambda get-function \
  --function-name <function-name> \
  --qualifier 2
```

**Bedrock Agent Configuration**:
```bash
# Get agent configuration for specific version
aws bedrock-agent get-agent \
  --agent-id <agent-id> \
  --agent-version "2"
```

### Deployment History

View deployment history in GitHub Actions:
1. Go to **Actions** → **Deploy Bedrock Agent**
2. Each workflow run shows:
   - Version deployed
   - Git commit SHA
   - Deployment timestamp
   - Deployment metadata artifact

Download deployment metadata:
```bash
# Using GitHub CLI
gh run download <run-id> -n deployment-metadata
cat deployment-info.json
```

## Cost Management

### S3 Versioning Costs

S3 versioning increases storage costs as each version consumes space. Lifecycle policies mitigate this:

- **Noncurrent Version Expiration**: 90 days
- **Noncurrent Versions to Retain**: 5

**Estimated Cost Impact**:
- If you update a 1MB file daily, you'll store ~5-90 versions (5MB-90MB)
- Older versions transition to cheaper storage classes automatically

### Lambda Versioning Costs

Lambda versions consume minimal storage. Old versions can be deleted manually:

```bash
# List versions
aws lambda list-versions-by-function --function-name <function-name>

# Delete old version
aws lambda delete-function --function-name <function-name> --qualifier 5
```

### Monitoring Costs

Use AWS Cost Explorer with tags to track costs by version:
```
Filter by Tag: Version = 1.0.0
```

## Best Practices

1. **Always bump version before significant changes**: Use semantic versioning appropriately
2. **Test in dev/staging first**: Deploy to dev, then staging, then prod
3. **Tag releases**: Always create git tags for deployed versions
4. **Document changes**: Update CHANGELOG.md or commit messages with clear descriptions
5. **Monitor deployments**: Check CloudWatch logs and metrics after deployment
6. **Keep deployment metadata**: GitHub Actions stores deployment artifacts for 90 days
7. **Clean up old versions**: Periodically review and delete unused Lambda versions
8. **Review lifecycle policies**: Adjust S3 lifecycle policies based on your retention requirements

## Troubleshooting

### Version Mismatch

If deployed version doesn't match package.json:
```bash
# Check deployed version from CloudFormation stack description
aws cloudformation describe-stacks --stack-name ComputeStack

# Check git tags
git tag

# Ensure you pushed the tag
git push origin v1.0.0
```

### Rollback Failed

If rollback fails:
1. Check CloudFormation stack events for errors
2. Verify the target version exists in git tags
3. Ensure IAM permissions are correct
4. Try manual rollback using alias updates

### S3 Version Limit

If you hit S3 version limits:
1. Reduce `noncurrentVersionsToRetain` in lifecycle policy
2. Reduce `noncurrentVersionExpiration` days
3. Manually delete old versions using AWS CLI

## Additional Resources

- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [AWS Lambda Versioning](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
- [AWS Bedrock Agent Versioning](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-versioning.html)
- [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Semantic Versioning](https://semver.org/)
