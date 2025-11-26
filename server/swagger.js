const swaggerJsdoc = require("swagger-jsdoc");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5001/api";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskPro API",
      version: "1.0.0",
      description: "REST API documentation for TaskPro (auth, boards, columns, cards, help, profile)",
    },
    servers: [{ url: API_BASE_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            avatarURL: { type: "string" },
            theme: { type: "string", enum: ["light", "dark", "violet"] },
          },
        },
        Board: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            background: { type: "string" },
            icon: { type: "string" },
            isFavorite: { type: "boolean" },
          },
        },
        Column: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            boardId: { type: "string" },
          },
        },
        Card: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["Without", "Low", "Medium", "High"] },
            deadline: { type: "string", format: "date-time" },
            columnId: { type: "string" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            token: { type: "string" },
            refreshToken: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          summary: "Register user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "Login user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/profile": {
        get: {
          summary: "Get current user profile",
          tags: ["Auth"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Profile",
              content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } },
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          summary: "Update profile (name/email/password/avatar)",
          tags: ["Auth"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    avatar: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/auth/refresh-token": {
        post: {
          summary: "Refresh access token",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } },
          },
          responses: {
            200: { description: "New tokens", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
          },
        },
      },
      "/help": {
        post: {
          summary: "Send help request",
          tags: ["Help"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["email", "comment"], properties: { email: { type: "string" }, comment: { type: "string" } } } } },
          },
          responses: {
            200: { description: "Email sent", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            400: { description: "Validation error" },
          },
        },
      },
      "/boards": {
        get: {
          summary: "List boards",
          tags: ["Boards"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Boards", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Board" } } } } },
          },
        },
        post: {
          summary: "Create board",
          tags: ["Boards"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["title"], properties: { title: { type: "string" }, icon: { type: "string" }, background: { type: "string" } } } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/boards/{id}": {
        patch: {
          summary: "Update board",
          tags: ["Boards"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object" } } } },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          summary: "Delete board",
          tags: ["Boards"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/columns": {
        post: {
          summary: "Create column",
          tags: ["Columns"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["boardId", "title"], properties: { boardId: { type: "string" }, title: { type: "string" } } } } },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/columns/{id}": {
        patch: {
          summary: "Update column",
          tags: ["Columns"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" } } } } } },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          summary: "Delete column",
          tags: ["Columns"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/cards": {
        post: {
          summary: "Create card",
          tags: ["Cards"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["columnId", "cardData"],
                  properties: {
                    columnId: { type: "string" },
                    cardData: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string" },
                        deadline: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Created" } },
        },
      },
      "/cards/{id}": {
        patch: {
          summary: "Update card",
          tags: ["Cards"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object" } } } },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          summary: "Delete card",
          tags: ["Cards"],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/cards/move": {
        post: {
          summary: "Move card to another column",
          tags: ["Cards"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { cardId: { type: "string" }, newColumnId: { type: "string" } } } } },
          },
          responses: { 200: { description: "Moved" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
