import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/environment';
import { logWithContext } from '@/utils/logger';

/**
 * Extended Request interface to include organization context
 * This follows the same pattern as your existing Zephyr architecture
 */
export interface AuthenticatedRequest extends Request {
  organizationName?: string;
  organizationValidated?: boolean; // Track if validation already completed
  user?: {
    id: string;
    email: string;
    organizationName: string;
  };
}

/**
 * Authentication middleware for organization-level access control
 * 
 * This middleware implements a simple authentication strategy that can be extended
 * to integrate with your existing Zephyr JWT authentication system.
 * 
 * For now, it validates organization name from headers, but you can replace this
 * with JWT token validation or API key validation as needed.
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract organization name from various sources
    const organizationName = 
      req.headers['x-organization-name'] as string ||
      req.query.organizationName as string ||
      req.params.organizationName as string;

    if (!organizationName) {
      logWithContext.warn('Authentication failed: Missing organization name', undefined, {
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

    // Validate organization name format (basic validation)
    if (!isValidOrganizationName(organizationName)) {
      logWithContext.warn('Authentication failed: Invalid organization name format', organizationName, {
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

    // TODO: Add JWT token validation here if integrating with Zephyr's auth system
    // Example:
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: true, message: 'Missing or invalid token' });
    // }
    // const token = authHeader.substring(7);
    // const decoded = jwt.verify(token, config.JWT_SECRET);
    // req.user = decoded;

    // TODO: Add API key validation as alternative
    // const apiKey = req.headers[config.API_KEY_HEADER];
    // if (apiKey && !validateApiKey(apiKey, organizationName)) {
    //   return res.status(401).json({ error: true, message: 'Invalid API key' });
    // }

    // Add organization context to request
    req.organizationName = organizationName;

    // For now, create a mock user object - replace with actual user data from JWT
    req.user = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      organizationName: organizationName,
    };

    logWithContext.info('Authentication successful', organizationName, {
      userId: req.user.id,
      userEmail: req.user.email,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logWithContext.error('Authentication middleware error', error as Error, req.organizationName);
    
    res.status(500).json({
      error: true,
      message: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Validate organization name format
 * Follows common naming conventions: alphanumeric, hyphens, underscores
 */
function isValidOrganizationName(name: string): boolean {
  // Basic validation: 3-50 characters, alphanumeric, hyphens, underscores
  const regex = /^[a-zA-Z0-9_-]{3,50}$/;
  return regex.test(name);
}

/**
 * Optional: API key validation function
 * You can implement this to validate API keys against your database
 */
function validateApiKey(apiKey: string, organizationName: string): boolean {
  // TODO: Implement API key validation logic
  // This could check against a database of valid API keys
  // For now, return true as placeholder
  return true;
}

/**
 * Optional: Organization access validation
 * This would check if the authenticated user has access to the requested organization
 */
export const validateOrganizationAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestedOrg = req.organizationName;
  const userOrg = req.user?.organizationName;

  if (requestedOrg !== userOrg) {
    logWithContext.warn('Organization access denied', requestedOrg, {
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

/**
 * Organization data access validation middleware
 * Validates once per request and stores result on request object
 */
export const validateOrganizationDataAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationName = req.params.organizationName;

  if (!organizationName) {
    res.status(400).json({
      error: true,
      message: 'Organization name is required in URL parameters.',
      code: 'MISSING_ORGANIZATION_PARAM',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Skip validation if already performed for this request
  if (req.organizationValidated) {
    next();
    return;
  }

  try {
    // Import here to avoid circular dependency
    const { doraService } = await import('@/services/dora-service');

    const hasAccess = await doraService.validateOrganizationAccess(organizationName);

    if (!hasAccess) {
      logWithContext.warn('Organization data access denied - no data found', organizationName, {
        userId: req.user?.id,
        path: req.path
      });

      res.status(404).json({
        error: true,
        message: 'No data found for the specified organization.',
        code: 'ORGANIZATION_NO_DATA',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Mark as validated to prevent duplicate checks
    req.organizationValidated = true;

    logWithContext.info('Organization validation completed', organizationName, {
      userId: req.user?.id,
      path: req.path
    });

    next();
  } catch (error) {
    logWithContext.error('Organization data validation failed', error as Error, organizationName);

    res.status(503).json({
      error: true,
      message: 'Unable to validate organization access.',
      code: 'VALIDATION_SERVICE_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
};