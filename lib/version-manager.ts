import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface VersionMetadata {
    readonly version: string;
    readonly gitCommitSha?: string;
    readonly deploymentTimestamp: string;
}

/**
 * Centralized version management utility for the CDK application.
 * Extracts version from package.json and git metadata for resource tagging.
 */
export class VersionManager {
    private static instance: VersionManager;
    private versionMetadata: VersionMetadata;

    private constructor() {
        this.versionMetadata = this.loadVersionMetadata();
    }

    /**
     * Gets the singleton instance of VersionManager
     */
    public static getInstance(): VersionManager {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }

    /**
     * Gets the complete version metadata
     */
    public getVersionMetadata(): VersionMetadata {
        return this.versionMetadata;
    }

    /**
     * Gets the application version
     */
    public getVersion(): string {
        return this.versionMetadata.version;
    }

    /**
     * Gets the git commit SHA (if available)
     */
    public getGitCommitSha(): string | undefined {
        return this.versionMetadata.gitCommitSha;
    }

    /**
     * Gets the deployment timestamp
     */
    public getDeploymentTimestamp(): string {
        return this.versionMetadata.deploymentTimestamp;
    }

    /**
     * Loads version metadata from package.json and git
     */
    private loadVersionMetadata(): VersionMetadata {
        const version = this.extractVersionFromPackageJson();
        const gitCommitSha = this.extractGitCommitSha();
        const deploymentTimestamp = new Date().toISOString();

        this.validateVersion(version);

        return {
            version,
            gitCommitSha,
            deploymentTimestamp,
        };
    }

    /**
     * Extracts version from package.json
     */
    private extractVersionFromPackageJson(): string {
        const packageJsonPath = path.join(__dirname, '../package.json');

        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`package.json not found at ${packageJsonPath}`);
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (!packageJson.version) {
            throw new Error('Version not found in package.json');
        }

        return packageJson.version;
    }

    /**
     * Extracts git commit SHA (returns undefined if not in a git repository)
     */
    private extractGitCommitSha(): string | undefined {
        try {
            const commitSha = execSync('git rev-parse --short HEAD', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'],
            }).trim();
            return commitSha;
        } catch (error) {
            // Not in a git repository or git not available
            console.warn('Unable to extract git commit SHA:', error);
            return undefined;
        }
    }

    /**
     * Validates version format (semantic versioning)
     */
    private validateVersion(version: string): void {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

        if (!semverRegex.test(version)) {
            throw new Error(
                `Invalid version format: ${version}. Expected semantic versioning (e.g., 1.0.0, 1.0.0-beta.1)`
            );
        }
    }

    /**
     * Generates a version description for CloudFormation stacks
     */
    public getVersionDescription(): string {
        const { version, gitCommitSha, deploymentTimestamp } = this.versionMetadata;
        const commitInfo = gitCommitSha ? ` (commit: ${gitCommitSha})` : '';
        return `Version ${version}${commitInfo} - Deployed at ${deploymentTimestamp}`;
    }
}
