"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadCollectionConstruct = void 0;
const generative_ai_cdk_constructs_1 = require("@cdklabs/generative-ai-cdk-constructs");
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const s3_assets = __importStar(require("aws-cdk-lib/aws-s3-assets"));
const constructs_1 = require("constructs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_manager_1 = require("../../config-manager");
const constants_1 = require("../../constants");
// Construct that defines the lead collection logic via Lambda and Bedrock Action Group
class LeadCollectionConstruct extends constructs_1.Construct {
    actionGroup;
    leadCollectionFunction;
    constructor(scope, id, props) {
        super(scope, id);
        // Loads the API schema asset for the lead collection action group
        const leadSchemaAsset = this.loadSchemaAsset();
        // References the DynamoDB table where leads will be stored
        const leadsTable = dynamodb.Table.fromTableAttributes(this, 'ImportedLeadTable', {
            tableArn: props.leadTableArn,
        });
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Provisions the Lambda function that processes lead collection requests
        this.leadCollectionFunction = new lambda.Function(this, 'LeadCollectionFunction', {
            functionName: `${config.appName.toLowerCase()}-lead-collector`,
            runtime: constants_1.LAMBDA_PYTHON_RUNTIME,
            architecture: lambda.Architecture.ARM_64,
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/lead-collector'), {
                bundling: {
                    image: constants_1.LAMBDA_PYTHON_RUNTIME.bundlingImage,
                    command: [
                        'bash', '-c',
                        'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output',
                    ],
                },
            }),
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(60),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                LEADS_TABLE_NAME: props.leadTableName,
            },
        });
        // Creates the Bedrock Action Group for lead collection with schema and executor
        this.actionGroup = new generative_ai_cdk_constructs_1.bedrock.AgentActionGroup({
            name: 'lead-collection',
            enabled: true,
            description: 'Collects and manages user leads.',
            apiSchema: generative_ai_cdk_constructs_1.bedrock.ApiSchema.fromS3File(leadSchemaAsset.bucket, leadSchemaAsset.s3ObjectKey),
            executor: generative_ai_cdk_constructs_1.bedrock.ActionGroupExecutor.fromlambdaFunction(this.leadCollectionFunction),
        });
        // Grants the Lambda function permission to write data to the leads table
        leadsTable.grantWriteData(this.leadCollectionFunction);
    }
    loadSchemaAsset() {
        const assetsPath = path.join(__dirname, '../../../assets/api-schema/lead-collection.json');
        if (!fs.existsSync(assetsPath)) {
            throw new Error(`Lead collection schema not found at ${assetsPath}`);
        }
        // Creates an S3 asset from the local API schema file
        return new s3_assets.Asset(this, 'LeadSchemaAsset', {
            path: assetsPath,
        });
    }
}
exports.LeadCollectionConstruct = LeadCollectionConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZC1jb2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGVhZC1jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdGQUFnRTtBQUNoRSxpREFBbUM7QUFDbkMsbUVBQXFEO0FBQ3JELCtEQUFpRDtBQUNqRCxxRUFBdUQ7QUFDdkQsMkNBQXVDO0FBQ3ZDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IseURBQXFEO0FBQ3JELCtDQUF3RDtBQU94RCx1RkFBdUY7QUFDdkYsTUFBYSx1QkFBd0IsU0FBUSxzQkFBUztJQUNsQyxXQUFXLENBQTJCO0lBQ3RDLHNCQUFzQixDQUFrQjtJQUV4RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW1DO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsa0VBQWtFO1FBQ2xFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQywyREFBMkQ7UUFDM0QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDN0UsUUFBUSxFQUFFLEtBQUssQ0FBQyxZQUFZO1NBQy9CLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELHlFQUF5RTtRQUN6RSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUM5RSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUQsT0FBTyxFQUFFLGlDQUFxQjtZQUM5QixZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNO1lBQ3hDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQ0FBb0MsQ0FBQyxFQUFFO2dCQUNwRixRQUFRLEVBQUU7b0JBQ04sS0FBSyxFQUFFLGlDQUFxQixDQUFDLGFBQWE7b0JBQzFDLE9BQU8sRUFBRTt3QkFDTCxNQUFNLEVBQUUsSUFBSTt3QkFDWiw0RUFBNEU7cUJBQy9FO2lCQUNKO2FBQ0osQ0FBQztZQUNGLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTTtZQUM5QixXQUFXLEVBQUU7Z0JBQ1QsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGFBQWE7YUFDeEM7U0FDSixDQUFDLENBQUM7UUFFSCxnRkFBZ0Y7UUFDaEYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLHNDQUFPLENBQUMsZ0JBQWdCLENBQUM7WUFDNUMsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxrQ0FBa0M7WUFDL0MsU0FBUyxFQUFFLHNDQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUM7WUFDNUYsUUFBUSxFQUFFLHNDQUFPLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1NBQ3hGLENBQUMsQ0FBQztRQUVILHlFQUF5RTtRQUN6RSxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxlQUFlO1FBQ25CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlEQUFpRCxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxxREFBcUQ7UUFDckQsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ2hELElBQUksRUFBRSxVQUFVO1NBQ25CLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTlERCwwREE4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiZWRyb2NrIH0gZnJvbSAnQGNka2xhYnMvZ2VuZXJhdGl2ZS1haS1jZGstY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIHMzX2Fzc2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtYXNzZXRzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbmZpZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9jb25maWctbWFuYWdlcic7XG5pbXBvcnQgeyBMQU1CREFfUFlUSE9OX1JVTlRJTUUgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExlYWRDb2xsZWN0aW9uQ29uc3RydWN0UHJvcHMge1xuICAgIHJlYWRvbmx5IGxlYWRUYWJsZUFybjogc3RyaW5nO1xuICAgIHJlYWRvbmx5IGxlYWRUYWJsZU5hbWU6IHN0cmluZztcbn1cblxuLy8gQ29uc3RydWN0IHRoYXQgZGVmaW5lcyB0aGUgbGVhZCBjb2xsZWN0aW9uIGxvZ2ljIHZpYSBMYW1iZGEgYW5kIEJlZHJvY2sgQWN0aW9uIEdyb3VwXG5leHBvcnQgY2xhc3MgTGVhZENvbGxlY3Rpb25Db25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpb25Hcm91cDogYmVkcm9jay5BZ2VudEFjdGlvbkdyb3VwO1xuICAgIHB1YmxpYyByZWFkb25seSBsZWFkQ29sbGVjdGlvbkZ1bmN0aW9uOiBsYW1iZGEuRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTGVhZENvbGxlY3Rpb25Db25zdHJ1Y3RQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIC8vIExvYWRzIHRoZSBBUEkgc2NoZW1hIGFzc2V0IGZvciB0aGUgbGVhZCBjb2xsZWN0aW9uIGFjdGlvbiBncm91cFxuICAgICAgICBjb25zdCBsZWFkU2NoZW1hQXNzZXQgPSB0aGlzLmxvYWRTY2hlbWFBc3NldCgpO1xuICAgICAgICAvLyBSZWZlcmVuY2VzIHRoZSBEeW5hbW9EQiB0YWJsZSB3aGVyZSBsZWFkcyB3aWxsIGJlIHN0b3JlZFxuICAgICAgICBjb25zdCBsZWFkc1RhYmxlID0gZHluYW1vZGIuVGFibGUuZnJvbVRhYmxlQXR0cmlidXRlcyh0aGlzLCAnSW1wb3J0ZWRMZWFkVGFibGUnLCB7XG4gICAgICAgICAgICB0YWJsZUFybjogcHJvcHMubGVhZFRhYmxlQXJuLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgdGhlIExhbWJkYSBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyBsZWFkIGNvbGxlY3Rpb24gcmVxdWVzdHNcbiAgICAgICAgdGhpcy5sZWFkQ29sbGVjdGlvbkZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnTGVhZENvbGxlY3Rpb25GdW5jdGlvbicsIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogYCR7Y29uZmlnLmFwcE5hbWUudG9Mb3dlckNhc2UoKX0tbGVhZC1jb2xsZWN0b3JgLFxuICAgICAgICAgICAgcnVudGltZTogTEFNQkRBX1BZVEhPTl9SVU5USU1FLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOiBsYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3JjL2xhbWJkYS9sZWFkLWNvbGxlY3RvcicpLCB7XG4gICAgICAgICAgICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IExBTUJEQV9QWVRIT05fUlVOVElNRS5idW5kbGluZ0ltYWdlLFxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFzaCcsICctYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAncGlwIGluc3RhbGwgLXIgcmVxdWlyZW1lbnRzLnR4dCAtdCAvYXNzZXQtb3V0cHV0ICYmIGNwIC1hdSAuIC9hc3NldC1vdXRwdXQnLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgICAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgTEVBRFNfVEFCTEVfTkFNRTogcHJvcHMubGVhZFRhYmxlTmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgdGhlIEJlZHJvY2sgQWN0aW9uIEdyb3VwIGZvciBsZWFkIGNvbGxlY3Rpb24gd2l0aCBzY2hlbWEgYW5kIGV4ZWN1dG9yXG4gICAgICAgIHRoaXMuYWN0aW9uR3JvdXAgPSBuZXcgYmVkcm9jay5BZ2VudEFjdGlvbkdyb3VwKHtcbiAgICAgICAgICAgIG5hbWU6ICdsZWFkLWNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29sbGVjdHMgYW5kIG1hbmFnZXMgdXNlciBsZWFkcy4nLFxuICAgICAgICAgICAgYXBpU2NoZW1hOiBiZWRyb2NrLkFwaVNjaGVtYS5mcm9tUzNGaWxlKGxlYWRTY2hlbWFBc3NldC5idWNrZXQsIGxlYWRTY2hlbWFBc3NldC5zM09iamVjdEtleSksXG4gICAgICAgICAgICBleGVjdXRvcjogYmVkcm9jay5BY3Rpb25Hcm91cEV4ZWN1dG9yLmZyb21sYW1iZGFGdW5jdGlvbih0aGlzLmxlYWRDb2xsZWN0aW9uRnVuY3Rpb24pLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHcmFudHMgdGhlIExhbWJkYSBmdW5jdGlvbiBwZXJtaXNzaW9uIHRvIHdyaXRlIGRhdGEgdG8gdGhlIGxlYWRzIHRhYmxlXG4gICAgICAgIGxlYWRzVGFibGUuZ3JhbnRXcml0ZURhdGEodGhpcy5sZWFkQ29sbGVjdGlvbkZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRTY2hlbWFBc3NldCgpOiBzM19hc3NldHMuQXNzZXQge1xuICAgICAgICBjb25zdCBhc3NldHNQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL2Fzc2V0cy9hcGktc2NoZW1hL2xlYWQtY29sbGVjdGlvbi5qc29uJyk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhhc3NldHNQYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMZWFkIGNvbGxlY3Rpb24gc2NoZW1hIG5vdCBmb3VuZCBhdCAke2Fzc2V0c1BhdGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGVzIGFuIFMzIGFzc2V0IGZyb20gdGhlIGxvY2FsIEFQSSBzY2hlbWEgZmlsZVxuICAgICAgICByZXR1cm4gbmV3IHMzX2Fzc2V0cy5Bc3NldCh0aGlzLCAnTGVhZFNjaGVtYUFzc2V0Jywge1xuICAgICAgICAgICAgcGF0aDogYXNzZXRzUGF0aCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19