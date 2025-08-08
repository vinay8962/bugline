/**
 * Widget Controller
 * Handles API endpoints for BugLine widget integration
 */

import * as BugService from '../services/bugService.js';
import * as ProjectService from '../services/projectService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/responseHelpers.js';
import { logInfo, logError, logPerformance, logUserAction } from '../utils/logger.js';

/**
 * Validate project token and return project configuration
 * GET /api/v1/widgets/validate
 */
export const validateProjectToken = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Project is already validated by authenticateWidget middleware
  const project = req.project;
  const company = req.company;

  logInfo('Widget token validation successful', {
    projectId: project.id,
    companyId: company.id,
    origin: req.get('Origin')
  });

  const duration = Date.now() - startTime;
  logPerformance('Widget token validation', duration, { projectId: project.id });

  sendSuccess(res, {
    valid: true,
    projectId: project.id,
    projectName: project.name,
    companyId: company.id,
    companyName: company.name,
    allowedDomains: project.allowed_domains || [],
    widgetSettings: project.widget_settings || {}
  }, 'Project token is valid');
});

/**
 * Submit bug report from widget
 * POST /api/v1/widgets/bugs/report
 */
export const reportBug = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const project = req.project;
  const company = req.company;

  // Data is already sanitized by sanitizeWidgetData middleware
  const {
    title,
    description,
    reporter_email,
    error_details,
    environment,
    priority = 'medium'
  } = req.body;

  logInfo('Widget bug report submission', {
    projectId: project.id,
    companyId: company.id,
    hasReporterEmail: !!reporter_email,
    hasErrorDetails: !!error_details,
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent')
  });

  try {
    // Create bug with widget-specific data
    const bugData = {
      project_id: project.id,
      title,
      description,
      priority,
      status: 'open',
      source: 'widget',
      reporter_email: reporter_email || null,
      error_details: error_details || null,
      environment: {
        ...environment,
        origin: req.get('Origin'),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        submittedAt: new Date().toISOString()
      }
    };

    const bug = await BugService.createBug(bugData);

    const duration = Date.now() - startTime;
    logPerformance('Widget bug report creation', duration, { 
      bugId: bug.id,
      projectId: project.id 
    });

    logUserAction(null, 'widget_bug_reported', {
      bugId: bug.id,
      projectId: project.id,
      companyId: company.id,
      source: 'widget',
      hasReporterEmail: !!reporter_email,
      priority
    });

    // Return minimal response for widget
    sendSuccess(res, {
      bugId: bug.id,
      status: bug.status,
      submittedAt: bug.created_at
    }, 'Bug report submitted successfully', 201);

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Widget bug report creation failed', {
      error: error.message,
      projectId: project.id,
      companyId: company.id,
      duration
    });
    throw error;
  }
});

/**
 * Get widget configuration for a project
 * GET /api/v1/widgets/config
 */
export const getWidgetConfig = asyncHandler(async (req, res) => {
  const project = req.project;
  const company = req.company;

  // Return widget-specific configuration
  const config = {
    projectId: project.id,
    projectName: project.name,
    companyName: company.name,
    settings: project.widget_settings || {},
    allowedDomains: project.allowed_domains || [],
    features: {
      autoErrorCapture: true,
      manualReporting: true,
      emailCollection: true
    }
  };

  sendSuccess(res, config, 'Widget configuration retrieved');
});

/**
 * Update widget settings (internal endpoint - requires authentication)
 * PUT /api/v1/projects/:projectId/widget/settings
 */
export const updateWidgetSettings = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { allowed_domains, widget_settings } = req.body;

  logInfo('Updating widget settings', {
    projectId,
    userId: req.user?.id,
    hasAllowedDomains: !!allowed_domains,
    hasWidgetSettings: !!widget_settings
  });

  const updateData = {};
  
  if (allowed_domains !== undefined) {
    // Validate domains array
    if (!Array.isArray(allowed_domains)) {
      return sendError(res, 'allowed_domains must be an array', 400);
    }
    
    updateData.allowed_domains = allowed_domains;
  }

  if (widget_settings !== undefined) {
    // Validate settings object
    if (typeof widget_settings !== 'object' || widget_settings === null) {
      return sendError(res, 'widget_settings must be an object', 400);
    }
    
    updateData.widget_settings = widget_settings;
  }

  try {
    const updatedProject = await ProjectService.updateProject(projectId, updateData);

    logUserAction(req.user?.id, 'widget_settings_updated', {
      projectId,
      allowedDomains: allowed_domains,
      settingsKeys: widget_settings ? Object.keys(widget_settings) : []
    });

    sendSuccess(res, {
      projectId: updatedProject.id,
      allowed_domains: updatedProject.allowed_domains,
      widget_settings: updatedProject.widget_settings
    }, 'Widget settings updated successfully');

  } catch (error) {
    logError('Widget settings update failed', {
      error: error.message,
      projectId,
      userId: req.user?.id
    });
    throw error;
  }
});

/**
 * Get widget analytics/stats (internal endpoint)
 * GET /api/v1/projects/:projectId/widget/stats
 */
export const getWidgetStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { period = '7d' } = req.query;

  // This would typically aggregate widget bug reports
  // For now, return basic stats from bugs with source = 'widget'
  try {
    const stats = await BugService.getProjectBugStats(projectId, {
      source: 'widget',
      period
    });

    sendSuccess(res, stats, 'Widget statistics retrieved');
  } catch (error) {
    logError('Widget stats retrieval failed', {
      error: error.message,
      projectId
    });
    throw error;
  }
});

export default {
  validateProjectToken,
  reportBug,
  getWidgetConfig,
  updateWidgetSettings,
  getWidgetStats
};