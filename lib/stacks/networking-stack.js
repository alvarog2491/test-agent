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
exports.NetworkingStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../config-manager");
const vpc_network_1 = require("../constructs/networking/vpc-network");
// Stack for Networking layer 0
class NetworkingStack extends cdk.Stack {
    vpc;
    securityGroup;
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        const network = new vpc_network_1.VpcNetwork(this, 'VpcNetwork');
        this.vpc = network.vpc;
        this.securityGroup = network.securityGroup;
        cdk.Tags.of(this).add('Environment', config.stage);
        cdk.Tags.of(this).add('Project', config.agentName);
    }
}
exports.NetworkingStack = NetworkingStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29ya2luZy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5ldHdvcmtpbmctc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBR25DLHNEQUFrRDtBQUNsRCxzRUFBa0U7QUFJbEUsK0JBQStCO0FBQy9CLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMxQixHQUFHLENBQVc7SUFDZCxhQUFhLENBQW9CO0lBRWpELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsTUFBTSxNQUFNLEdBQUcsOEJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFFbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBVSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRTNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQWZELDBDQWVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciB9IGZyb20gJy4uL2NvbmZpZy1tYW5hZ2VyJztcbmltcG9ydCB7IFZwY05ldHdvcmsgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL25ldHdvcmtpbmcvdnBjLW5ldHdvcmsnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5ldHdvcmtpbmdTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMgeyB9XG5cbi8vIFN0YWNrIGZvciBOZXR3b3JraW5nIGxheWVyIDBcbmV4cG9ydCBjbGFzcyBOZXR3b3JraW5nU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIHB1YmxpYyByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICAgIHB1YmxpYyByZWFkb25seSBzZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cDtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogTmV0d29ya2luZ1N0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZ01hbmFnZXIuZ2V0SW5zdGFuY2UoKS5jb25maWc7XG5cbiAgICAgICAgY29uc3QgbmV0d29yayA9IG5ldyBWcGNOZXR3b3JrKHRoaXMsICdWcGNOZXR3b3JrJyk7XG4gICAgICAgIHRoaXMudnBjID0gbmV0d29yay52cGM7XG4gICAgICAgIHRoaXMuc2VjdXJpdHlHcm91cCA9IG5ldHdvcmsuc2VjdXJpdHlHcm91cDtcblxuICAgICAgICBjZGsuVGFncy5vZih0aGlzKS5hZGQoJ0Vudmlyb25tZW50JywgY29uZmlnLnN0YWdlKTtcbiAgICAgICAgY2RrLlRhZ3Mub2YodGhpcykuYWRkKCdQcm9qZWN0JywgY29uZmlnLmFnZW50TmFtZSk7XG4gICAgfVxufVxuIl19