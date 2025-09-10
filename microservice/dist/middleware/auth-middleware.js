"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrganizationAccess = exports.authMiddleware = void 0;
const logger_1 = require("@/utils/logger");
const authMiddleware = (req, res, next) => {
    try {
        const organizationName = req.headers['x-organization-name'] ||
            req.query.organizationName ||
            req.params.organizationName;
        if (!organizationName) {
            logger_1.logWithContext.warn('Authentication failed: Missing organization name', undefined, {
                headers: req.headers,
                url: req.url,
                ip: req.ip,
            });
            res.status(401).json({
                error: true,
                message: 'Organization name is required. Please provide it via x-organization-name header, query parameter, or URL parameter.',
                code: 'MISSING_ORGANIZATION',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!isValidOrganizationName(organizationName)) {
            logger_1.logWithContext.warn('Authentication failed: Invalid organization name format', organizationName, {
                providedName: organizationName,
                ip: req.ip,
            });
            res.status(401).json({
                error: true,
                message: 'Invalid organization name format.',
                code: 'INVALID_ORGANIZATION_FORMAT',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req.organizationName = organizationName;
        req.user = {
            id: 'mock-user-id',
            email: 'mock@example.com',
            organizationName: organizationName,
        };
        logger_1.logWithContext.info('Authentication successful', organizationName, {
            userId: req.user.id,
            userEmail: req.user.email,
            ip: req.ip,
        });
        next();
    }
    catch (error) {
        logger_1.logWithContext.error('Authentication middleware error', error, req.organizationName);
        res.status(500).json({
            error: true,
            message: 'Authentication service error',
            code: 'AUTH_SERVICE_ERROR',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authMiddleware = authMiddleware;
function isValidOrganizationName(name) {
    const regex = /^[a-zA-Z0-9_-]{3,50}$/;
    return regex.test(name);
}
function validateApiKey(apiKey, organizationName) {
    return true;
}
const validateOrganizationAccess = (req, res, next) => {
    const requestedOrg = req.organizationName;
    const userOrg = req.user?.organizationName;
    if (requestedOrg !== userOrg) {
        logger_1.logWithContext.warn('Organization access denied', requestedOrg, {
            userOrganization: userOrg,
            requestedOrganization: requestedOrg,
            userId: req.user?.id,
        });
        res.status(403).json({
            error: true,
            message: 'Access denied to the requested organization.',
            code: 'ORGANIZATION_ACCESS_DENIED',
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next();
};
exports.validateOrganizationAccess = validateOrganizationAccess;
//# sourceMappingURL=auth-middleware.js.map