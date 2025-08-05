import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BugLine API',
      version: '1.0.0',
      description: 'Complete API documentation for BugLine - A comprehensive bug tracking and project management system',
      contact: {
        name: 'BugLine Team',
        email: 'support@bugline.dev'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://api.bugline.dev',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoints'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            full_name: {
              type: 'string',
              description: 'User full name'
            },
            global_role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'USER'],
              description: 'Global user role'
            },
            email_verified: {
              type: 'boolean',
              description: 'Whether email is verified'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            companies: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserCompany'
              },
              description: 'Companies the user belongs to'
            }
          }
        },
        UserCompany: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Company ID'
            },
            name: {
              type: 'string',
              description: 'Company name'
            },
            slug: {
              type: 'string',
              description: 'Company slug'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'],
              description: 'User role in this company'
            }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique company identifier'
            },
            name: {
              type: 'string',
              description: 'Company name'
            },
            slug: {
              type: 'string',
              description: 'Company URL slug'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Company creation timestamp'
            },
            company_users: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CompanyUser'
              },
              description: 'Company members'
            },
            projects: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Project'
              },
              description: 'Company projects'
            }
          }
        },
        CompanyUser: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Membership ID'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'],
              description: 'Role in company'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique project identifier'
            },
            name: {
              type: 'string',
              description: 'Project name'
            },
            slug: {
              type: 'string',
              description: 'Project URL slug'
            },
            company_id: {
              type: 'string',
              description: 'Parent company ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            bug_stats: {
              $ref: '#/components/schemas/BugStats'
            }
          }
        },
        Bug: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique bug identifier'
            },
            title: {
              type: 'string',
              description: 'Bug title'
            },
            description: {
              type: 'string',
              description: 'Bug description'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Bug priority level'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'review', 'resolved', 'closed'],
              description: 'Bug status'
            },
            project_id: {
              type: 'string',
              description: 'Parent project ID'
            },
            reporter_id: {
              type: 'string',
              description: 'User who reported the bug'
            },
            assignee_id: {
              type: 'string',
              description: 'User assigned to fix the bug',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BugStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of bugs'
            },
            open: {
              type: 'integer',
              description: 'Number of open bugs'
            },
            in_progress: {
              type: 'integer',
              description: 'Number of bugs in progress'
            },
            resolved: {
              type: 'integer',
              description: 'Number of resolved bugs'
            },
            closed: {
              type: 'integer',
              description: 'Number of closed bugs'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful'
            },
            data: {
              type: 'string',
              description: 'Encrypted user data and token'
            },
            message: {
              type: 'string',
              description: 'Response message'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            pagination: {
              $ref: '#/components/schemas/Pagination'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              description: 'Items per page'
            },
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Error details'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };