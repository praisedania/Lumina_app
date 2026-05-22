const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Lumina LMS API',
    version: '1.0.0',
    description: 'Swagger UI documentation for the Lumina Learning Management System API.',
    contact: {
      name: 'Lumina Team'
    }
  },
  servers: [
    {
      url: '/',
      description: 'Root server base path'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      AuthPayload: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        },
        required: ['email', 'password']
      },
      RegisterPayload: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        },
        required: ['name', 'email', 'password']
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          instructorId: { type: 'string' }
        }
      },
      PaymentCheckout: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          paymentMethod: { type: 'string' }
        },
        required: ['courseId']
      },
      BankDetails: {
        type: 'object',
        properties: {
          accountNumber: { type: 'string' },
          bankCode: { type: 'string' },
          accountName: { type: 'string' }
        },
        required: ['accountNumber', 'bankCode', 'accountName']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Courses', description: 'Course management endpoints' },
    { name: 'Payments', description: 'Payment and checkout endpoints' },
    { name: 'Lessons', description: 'Lesson management endpoints' },
    { name: 'Enrollments', description: 'User enrollment endpoints' },
    { name: 'Instructor', description: 'Instructor dashboard endpoints' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterPayload' }
            }
          }
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthPayload' }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/switch-to-instructor': {
      patch: {
        tags: ['Auth'],
        summary: 'Switch user role to instructor',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Role switched to instructor' },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/courses/home': {
      get: {
        tags: ['Courses'],
        summary: 'List public courses for home page',
        responses: {
          '200': { description: 'List of public courses' }
        }
      }
    },
    '/api/courses/public': {
      get: {
        tags: ['Courses'],
        summary: 'List public courses',
        responses: {
          '200': { description: 'List of public courses' }
        }
      }
    },
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Get all courses for authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of courses' },
          '401': { description: 'Unauthorized' }
        }
      },
      post: {
        tags: ['Courses'],
        summary: 'Create a new course',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Course' }
            }
          }
        },
        responses: {
          '201': { description: 'Course created' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Get course by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Course details' },
          '404': { description: 'Course not found' }
        }
      },
      patch: {
        tags: ['Courses'],
        summary: 'Update an existing course',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Course' }
            }
          }
        },
        responses: {
          '200': { description: 'Course updated' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/payments/checkout': {
      post: {
        tags: ['Payments'],
        summary: 'Initialize payment checkout',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentCheckout' }
            }
          }
        },
        responses: {
          '200': { description: 'Payment checkout started' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/payments/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Payment gateway webhook endpoint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          '200': { description: 'Webhook processed' }
        }
      }
    },
    '/api/lessons': {
      post: {
        tags: ['Lessons'],
        summary: 'Create a lesson',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          '201': { description: 'Lesson created' }
        }
      }
    },
    '/api/lessons/{id}': {
      patch: {
        tags: ['Lessons'],
        summary: 'Update a lesson',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          '200': { description: 'Lesson updated' }
        }
      }
    },
    '/api/lessons/course/{courseId}': {
      get: {
        tags: ['Lessons'],
        summary: 'Get lessons for a course',
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Course lessons list' }
        }
      }
    },
    '/api/enroll/{courseId}': {
      post: {
        tags: ['Enrollments'],
        summary: 'Enroll in a course',
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Enrollment successful' }
        }
      }
    },
    '/api/enroll/progress/{lessonId}': {
      patch: {
        tags: ['Enrollments'],
        summary: 'Toggle lesson progress',
        parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Progress updated' }
        }
      }
    },
    '/api/enroll/my': {
      get: {
        tags: ['Enrollments'],
        summary: 'Get my enrollments',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user enrollments' }
        }
      }
    },
    '/api/instructor/profile/bank-details': {
      post: {
        tags: ['Instructor'],
        summary: 'Save instructor bank details',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankDetails' }
            }
          }
        },
        responses: {
          '200': { description: 'Bank details saved' }
        }
      }
    },
    '/api/instructor/dashboard/stats': {
      get: {
        tags: ['Instructor'],
        summary: 'Get instructor earnings statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Earnings statistics' }
        }
      }
    }
  }
};

export default swaggerSpec;
