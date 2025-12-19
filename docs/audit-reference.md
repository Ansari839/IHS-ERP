# Audit Logging System Reference

This document provides reference implementations for Audit Logging in Express.js and GraphQL, as requested.

## 1. Prisma Model

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  action      String   // e.g. "CREATE", "UPDATE", "DELETE"
  module      String   // e.g. "PRODUCTS", "ORDERS"
  resourceId  String?  // ID of the affected resource
  before      Json?    // State before action
  after       Json?    // State after action
  metadata    Json?    // IP, User Agent, etc.
  timestamp   DateTime @default(now())

  @@index([userId])
  @@index([module])
  @@index([action])
  @@index([timestamp])
}
```

## 2. Express Middleware

This middleware captures the response body to log the "after" state.

```typescript
import { Request, Response, NextFunction } from 'express'
import prisma from './lib/prisma'

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
    user?: { id: string }
}

export const auditMiddleware = (moduleName: string, actionType?: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const originalSend = res.send
        let responseBody: any

        // Override res.send to capture the response body
        res.send = function (body) {
            responseBody = body
            return originalSend.apply(this, arguments as any)
        }

        // Capture 'before' state for updates/deletes if needed
        // This usually requires fetching data based on req.params.id
        let beforeState = null
        if (req.method === 'PUT' || req.method === 'DELETE') {
             // Implementation depends on your service layer
             // beforeState = await getResource(req.params.id)
        }

        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                try {
                    await prisma.auditLog.create({
                        data: {
                            userId: req.user.id,
                            action: actionType || mapMethodToAction(req.method),
                            module: moduleName,
                            resourceId: req.params.id,
                            before: beforeState,
                            after: responseBody ? JSON.parse(responseBody) : null,
                            metadata: {
                                ip: req.ip,
                                userAgent: req.get('User-Agent')
                            }
                        }
                    })
                } catch (error) {
                    console.error('Audit logging failed:', error)
                }
            }
        })

        next()
    }
}

function mapMethodToAction(method: string): string {
    switch (method) {
        case 'POST': return 'CREATE'
        case 'PUT': case 'PATCH': return 'UPDATE'
        case 'DELETE': return 'DELETE'
        default: return 'READ'
    }
}
```

### Usage in Express Routes

```typescript
import express from 'express'
import { auditMiddleware } from './middleware/audit'

const router = express.Router()

router.post('/products', 
    auditMiddleware('PRODUCTS', 'CREATE'),
    createProductController
)

router.put('/products/:id',
    auditMiddleware('PRODUCTS', 'UPDATE'),
    updateProductController
)
```

## 3. GraphQL Middleware (Resolver Wrapper)

For GraphQL, we can wrap resolvers to handle logging.

```typescript
import prisma from './lib/prisma'

type ResolverFn = (parent: any, args: any, context: any, info: any) => Promise<any>

export const withAudit = (
    moduleName: string, 
    actionType: string, 
    resolver: ResolverFn
): ResolverFn => {
    return async (parent, args, context, info) => {
        // 1. Capture 'Before' state (optional, depends on args.id)
        let beforeState = null
        if (actionType === 'UPDATE' || actionType === 'DELETE') {
             // beforeState = await fetchResource(args.id)
        }

        // 2. Execute Resolver
        const result = await resolver(parent, args, context, info)

        // 3. Log Audit
        if (context.user) {
            // Fire-and-forget
            prisma.auditLog.create({
                data: {
                    userId: context.user.id,
                    action: actionType,
                    module: moduleName,
                    resourceId: result.id, // Assuming result has an ID
                    before: beforeState,
                    after: result,
                    metadata: {
                        ip: context.req.ip
                    }
                }
            }).catch(console.error)
        }

        return result
    }
}
```

### Usage in GraphQL Resolvers

```typescript
const resolvers = {
    Mutation: {
        createProduct: withAudit('PRODUCTS', 'CREATE', async (_, args, ctx) => {
             return await productService.create(args)
        }),
        updateProduct: withAudit('PRODUCTS', 'UPDATE', async (_, args, ctx) => {
             return await productService.update(args.id, args.data)
        })
    }
}
```
