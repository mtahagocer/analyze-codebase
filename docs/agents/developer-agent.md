# Developer Agent Documentation

## Overview

This document defines the rules and guidelines for the Developer Agent, an AI agent designed to write, maintain, and refactor code for the Uygar Koleji project. The agent follows the project's established patterns, conventions, and coding style.

## Purpose

The Developer Agent is responsible for:

- Writing new features following project conventions
- Refactoring existing code while maintaining consistency
- Fixing bugs and implementing improvements
- Ensuring code quality and type safety
- Following established architectural patterns
- Maintaining consistency with existing codebase

## Language

**All Developer Agent code and comments should be in English**, following the project's standard:

- Code comments: English
- Variable/function names: English
- Type definitions: English
- Error messages: Use i18next for user-facing messages
- Documentation: English for technical docs

## Design System and UI Guidelines

**When implementing UI components, animations, or visual effects, always refer to the [Design System documentation](../design/design-system.md).**

The design system defines:

- **Visual Language**: Color palettes, typography, spacing, and gradients
- **Animation Patterns**: Entrance animations, hover effects, transitions, and timing guidelines
- **Component Patterns**: Standard patterns for cards, buttons, forms, and navigation
- **Motion Guidelines**: When and how to use animations, performance considerations, and reduced motion support

**Key Design Principles**:

- Use the established color gradients (emerald to sky for primary actions, rose to pink for destructive actions)
- Follow animation timing guidelines (300ms for transitions, 500-600ms for entrances)
- Implement hover effects consistently (lift, shadow, border color changes, gradient overlays)
- Use Framer Motion variants from the animation library for consistency
- Ensure all animations respect `prefers-reduced-motion`

**Example**: When creating a new card component, use the interactive card pattern with gradient overlay on hover as documented in the design system.

## Code Style and Conventions

### 1. File Organization

#### API Routes (`src/app/api/`)

**Structure**:

```typescript
// Imports (grouped by type)
import {
  buildOkResponse,
  TSuccessResponse,
} from "@/lib/api/build-success-response";
import { BadRequestError } from "@/lib/api/errors/bad-request.error";
import { parseRequestBodyMiddleware } from "@/lib/api/middlewares";
import {
  ProtectedRequestContext,
  protectedRouter,
} from "@/lib/api/routers/protected-router";
import { buildRouteHandler } from "@/lib/api/routers/route-handler";

// Type definitions
export type GetResourceResponse = TSuccessResponse<Resource[]>;

// #region get
async function getResource(
  _req: NextRequest,
  ctx: ProtectedRequestContext<never, never, GetResourceSchema>,
): Promise<NextResponse<GetResourceResponse>> {
  // Implementation
}

const getRouter = protectedRouter<never, never, GetResourceSchema>()
  .use(parseRequestSearchParamsMiddleware(getResourceSchema))
  .get(getResource);

export const GET = buildRouteHandler((...params) => getRouter.run(...params));
//#endregion

// #region post
// Similar structure for POST
//#endregion
```

**Rules**:

- Use `#region` and `#endregion` to group HTTP methods
- Always use `ProtectedRequestContext` for protected routes
- Use `protectedRouter` with proper type parameters
- Export HTTP methods using `buildRouteHandler`
- Use `buildOkResponse` for successful responses
- Always include soft delete check: `eq(table.isDeleted, false)`
- Use appropriate error types: `BadRequestError`, `NotFoundError`
- Use i18next for error messages: `i18next.t('ApiRoutes.Utils.creationFailed')`

#### Services (`src/lib/services/`)

**Structure**:

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { HttpClient } from "../utils/http-client";
import {
  CreateResourceSchema,
  GetResourceSchema,
} from "../schemas/resource/...";

export const resourceRoutes = {
  resources: () => `/resources`,
  resourcesById: (id: string) => `/resources/${id}`,
};

export const getResources = (data: GetResourceSchema) =>
  HttpClient.get<GetResourceResponse>({
    url: resourceRoutes.resources(),
    params: data,
  });

export const getResourcesQueryKey = (data: GetResourceSchema) => [
  resourceRoutes.resources(),
  data.page,
  data.limit,
  // ... other relevant params
];

export const useGetResourcesQuery = (data: GetResourceSchema) =>
  useQuery({
    queryKey: getResourcesQueryKey(data),
    queryFn: () => getResources(data),
  });

export const createResource = (data: CreateResourceSchema) =>
  HttpClient.post<CreateResourceResponse>({
    url: resourceRoutes.resources(),
    data,
  });

export const useCreateResourceMutation = () =>
  useMutation({
    mutationFn: createResource,
  });
```

**Rules**:

- Define route constants using object with functions
- Create query key functions for React Query
- Use `useQuery` and `useMutation` hooks
- Follow naming: `useGetXQuery`, `useCreateXMutation`, `useUpdateXMutation`, `useDeleteXMutation`
- Import types from API route files

#### Schemas (`src/lib/schemas/`)

**Structure**:

```typescript
import z from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";

export const RESOURCE_ORDERABLE_COLUMNS = [
  "title",
  "createdAt",
  // ...
] as const;

export const createResourceSchema = () =>
  z.object({
    title: z.string().min(1),
    categoryId: z.string().uuid(),
    // ...
  });

export type CreateResourceSchema = z.infer<
  ReturnType<typeof createResourceSchema>
>;

export const createResourceSchemaClient = () =>
  createResourceSchema().extend({
    file: z.instanceof(File).optional(),
  });

export type CreateResourceSchemaClient = z.infer<
  ReturnType<typeof createResourceSchemaClient>
>;

export const getResourcesSchema = () =>
  z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce
      .number()
      .min(1)
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE),
    search: z.string().optional(),
    orderByColumn: z.enum(RESOURCE_ORDERABLE_COLUMNS).optional(),
    orderBy: z.enum(["asc", "desc"]).optional(),
  });

export type GetResourcesSchema = z.infer<ReturnType<typeof getResourcesSchema>>;
```

**Rules**:

- Use factory pattern: `export const createResourceSchema = () => z.object({...})`
- Use type inference: `export type CreateResourceSchema = z.infer<ReturnType<typeof createResourceSchema>>`
- Separate client and server schemas (client may include File types)
- Define orderable columns as const array
- Use `z.coerce` for query params that need type conversion
- Use transformations for date strings: `.transform((value) => value ? new Date(value).toISOString().split('T')[0] : undefined)`

#### Page Components (`src/app/[locale]/dashboard/`)

**Structure**:

```typescript
"use client";

import { useSetBreadcrumbs } from "@/components/dashboard/DashboardLayout";
import { BaseTable, useBaseTable } from "@/components/ui/BaseTable";
import { Button } from "@/components/ui/Button";
import { useQsHydratedState } from "@/hooks/use-qs-hydrated-state";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { paths } from "@/lib/constants/paths";
import { useGetResourcesQuery } from "@/lib/services/resource";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
```

**Design Guidelines**:

- Use Framer Motion for page-level animations (see [Design System](../design/design-system.md))
- Implement staggered entrance animations for lists/grids
- Add hover effects to interactive cards following the design system patterns
- Use semantic gradient colors for action buttons (emerald/sky for updates, rose/pink for deletes)

const ResourcesPage = () => {
const { t, i18n: { language } } = useTranslation();

const [filters, setFilters] = useQsHydratedState(getResourcesSchema, {
defaultValue: {
page: 1,
limit: DEFAULT_PAGE_SIZE,
orderBy: 'desc',
orderByColumn: 'createdAt',
},
});

const queryResult = useGetResourcesQuery(filters);

useSetBreadcrumbs([
{ label: t('Navigation.dashboard'), href: paths.dashboard.index },
{ label: t('Navigation.Resources'), href: paths.dashboard.resources },
]);

// #region table config
const columns: ColumnDef<Resource>[] = useMemo(
() => [
// Column definitions
],
[dependencies],
);
//#endregion

const table = useBaseTable({
data: queryResult.data?.data?.data || [],
columns,
// ... other config
});

return (

<div className="w-full">
{/_ Component JSX _/}
</div>
);
};

export default ResourcesPage;

````

**Rules**:
- Always use `'use client'` directive
- Use `useTranslation` from `react-i18next`
- Use `useQsHydratedState` for URL query state management
- Use `useSetBreadcrumbs` for breadcrumb navigation
- Use `useMemo` for column definitions
- Use `#region` comments for table configuration
- Always handle loading states
- Use `BaseTable` component for tables
- Use `Pagination` component for pagination

#### Sheet Components (`_components/`)

**Structure**:
```typescript
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { useCreateResourceMutation } from '@/lib/services/resource';
import { StorageService } from '@/lib/services/storage';
import { queryClient } from '@/lib/utils/query-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const CreateResourceSheet: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation();
  const { session } = useAuthStore();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createResourceMutation = useCreateResourceMutation();

  const onSubmit = async (data: CreateResourceSchemaClient) => {
    try {
      setIsLoading(true);

      // File upload logic if needed
      let fileUrl: string | undefined;
      if (data.file) {
        const fileName = `${session!.user.id}/resource-${Date.now()}-${createSafeURLForUploadingFileName(data.file.name)}`;
        toast.loading(t('ResourcesPage.uploadingFile'));

        const { error, uploadResult } = await StorageService.uploadFileSigned(
          Bucket.RESOURCES,
          fileName,
          data.file,
        );

        if (error || !uploadResult) {
          throw new Error(error.message);
        }

        fileUrl = uploadResult.path;
      }

      await createResourceMutation.mutateAsync({
        ...data,
        fileUrl,
      });

      onOpenChange(false);
      setIsLoading(false);

      queryClient.invalidateQueries({
        queryKey: [resourceRoutes.resources()],
      });
    } catch (error) {
      console.error('🚀 ~ onSubmit ~ error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      {isSheetOpen && (
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('ResourcesPage.createResource')}</SheetTitle>
          </SheetHeader>
          <ResourceForm onSubmit={onSubmit} isLoading={isLoading} />
        </SheetContent>
      )}
    </Sheet>
  );
};
````

**Rules**:

- Use `Sheet` component from `@/components/ui/Sheet`
- Handle file uploads using `StorageService.uploadFileSigned`
- Use `toast` from `sonner` for notifications
- Invalidate queries after mutations
- Always handle loading states
- Use `console.error` with emoji prefix for error logging: `console.error('🚀 ~ onSubmit ~ error:', error)`
- Clear query strings on close if needed

### 2. Naming Conventions

**Files**:

- API routes: `route.ts` (in `src/app/api/[resource]/`)
- Services: `[resource].ts` (in `src/lib/services/`)
- Schemas: `[action]-[resource]-schema.ts` (e.g., `create-income-schema.ts`)
- Pages: `page.tsx` (in `src/app/[locale]/dashboard/[resource]/`)
- Components: `[ComponentName].tsx` (PascalCase)
- Hooks: `use-[hook-name].ts` (kebab-case)

**Functions**:

- API handlers: `getResource`, `createResource`, `updateResource`, `deleteResource`
- Service functions: `getResource`, `createResource`, etc.
- React Query hooks: `useGetResourceQuery`, `useCreateResourceMutation`
- Query keys: `getResourceQueryKey`

**Variables**:

- Use camelCase: `isLoading`, `queryResult`, `setFilters`
- Boolean prefixes: `is`, `has`, `should` (e.g., `isLoading`, `hasError`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)

**Types**:

- Use PascalCase: `GetResourceResponse`, `CreateResourceSchema`
- Suffix with type: `Resource`, `ResourceSchema`, `ResourceResponse`

### 3. TypeScript Patterns

**Always**:

- Use strict TypeScript
- Define types explicitly, avoid `any`
- Use type inference where appropriate
- Use `as const` for literal types
- Use `ReturnType<typeof function>` for function return types
- Use `z.infer` for Zod schema types

**Type Definitions**:

```typescript
// In API routes
export type Resource = {
  id: string;
  title: string;
  // ...
};

export type GetResourceResponse = TSuccessResponse<{
  totalItemsCount: number;
  data: Resource[];
}>;

// In services
import { GetResourceResponse } from "@/app/api/resources/route";
```

### 4. Database Patterns

**Always**:

- Use Drizzle ORM
- Include soft delete check: `eq(table.isDeleted, false)`
- Use `db.query` for relations when possible
- Use `db.select().from()` for complex queries
- Use `and()` for multiple conditions
- Use `sql` template for complex SQL

**Example**:

```typescript
const where = and(
  eq(resources.isDeleted, false),
  search?.trim().length
    ? sql`LOWER(${resources.title}) LIKE LOWER(${`%${search.trim()}%`})`
    : undefined,
  categoryId ? eq(resources.categoryId, categoryId) : undefined,
);
```

### 5. Error Handling

**API Routes**:

```typescript
if (!result) {
  throw new NotFoundError(i18next.t("ApiRoutes.Utils.dataNotFound"));
}

if (count === 0) {
  throw new NotFoundError(i18next.t("ApiRoutes.Utils.dataNotFound"));
}
```

**Components**:

```typescript
try {
  // Operation
} catch (error) {
  console.error("🚀 ~ operation ~ error:", error);
  // Handle error
}
```

**Error Types**:

- `BadRequestError` - 400 errors
- `NotFoundError` - 404 errors
- Use i18next for error messages

### 6. Internationalization (i18n)

**Always**:

- Use `useTranslation` hook in components
- Use `i18next.t()` in API routes
- Use translation keys from `src/messages/`
- Never hardcode user-facing strings

**Example**:

```typescript
// In components
const { t } = useTranslation();
<Button>{t('Navigation.AddResource')}</Button>

// In API routes
import i18next from 'i18next';
throw new NotFoundError(i18next.t('ApiRoutes.Utils.dataNotFound'));
```

### 7. React Query Patterns

**Query Keys**:

```typescript
export const getResourcesQueryKey = (data: GetResourcesSchema) => [
  resourceRoutes.resources(),
  data.page,
  data.limit,
  data.search,
  // ... all relevant params
];
```

**Invalidation**:

```typescript
queryClient.invalidateQueries({
  queryKey: [resourceRoutes.resources()],
});
```

**Mutations**:

```typescript
export const useCreateResourceMutation = () =>
  useMutation({
    mutationFn: createResource,
  });
```

### 8. Code Organization

**Imports Order**:

1. External libraries (React, Next.js, etc.)
2. Internal components (`@/components/`)
3. Internal utilities (`@/lib/utils/`)
4. Internal services (`@/lib/services/`)
5. Internal schemas (`@/lib/schemas/`)
6. Internal types (`@/app/api/`)
7. Server-side imports (`@/server/`)

**Grouping**:

- Use `#region` comments for logical grouping
- Group related functions together
- Keep related types near their usage

### 9. Comments and Documentation

**Comments**:

- Use `//` for single-line comments
- Use `/* */` for multi-line comments
- Use `#region` / `#endregion` for code sections
- Explain "why" not "what"
- Use English for all comments

**Example**:

```typescript
// Determine if we need join-based query for sorting
const needsJoinForSorting =
  orderByColumn && ["accountTitle", "paymentStatus"].includes(orderByColumn);

// #region table config
const columns: ColumnDef<Resource>[] = useMemo(/* ... */);
//#endregion
```

### 10. Testing Considerations

**When Writing Code**:

- Make functions testable (pure functions where possible)
- Avoid side effects in utility functions
- Use dependency injection for services
- Keep components focused and small

**Type Checking**:

- **Always run `npm run format:fix && npm run typecheck` at the end of code changes**
- Ensure there are no TypeScript type errors before completing the task
- Fix any type errors that are discovered
- Type checking is mandatory and must pass before considering code complete

### 11. Performance Best Practices

**Always**:

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Use `React.memo` for expensive components (when needed)
- Optimize database queries (use indexes, avoid N+1)
- Use pagination for large datasets
- Use `Promise.all` for parallel operations

**Example**:

```typescript
const [countResult, data] = await Promise.all([
  db
    .select({ count: sql<number>`COUNT(*)::INTEGER` })
    .from(resources)
    .where(where),
  db.query.resources.findMany({ where, limit, offset }),
]);
```

### 12. Security Best Practices

**Always**:

- Validate all inputs using Zod schemas
- Use `ProtectedRequestContext` for protected routes
- Never trust client-side data
- Use parameterized queries (Drizzle handles this)
- Check permissions before operations

### 13. Common Patterns

#### Soft Delete Pattern

```typescript
await db
  .update(resources)
  .set({ isDeleted: true })
  .where(and(eq(resources.id, id), eq(resources.isDeleted, false)));
```

#### File Upload Pattern

```typescript
if (file) {
  const fileName = `${session!.user.id}/resource-${Date.now()}-${createSafeURLForUploadingFileName(file.name)}`;
  const { error, uploadResult } = await StorageService.uploadFileSigned(
    Bucket.RESOURCES,
    fileName,
    file,
  );
  if (error || !uploadResult) {
    throw new Error(error.message);
  }
  fileUrl = uploadResult.path;
}
```

#### Date Handling Pattern

```typescript
// In schemas
startDate: z
  .string()
  .optional()
  .transform((value) =>
    value ? new Date(value).toISOString().split('T')[0] : undefined,
  ),

// In API routes
date: new Date(ctx.payload.date),
createdAt: result.createdAt.toISOString(),
```

#### Sorting Pattern

```typescript
const needsJoinForSorting =
  orderByColumn && ["accountTitle", "paymentStatus"].includes(orderByColumn);

if (needsJoinForSorting) {
  // Use join-based sorting
} else {
  // Use direct column sorting
}
```

## Code Review Checklist

When reviewing or writing code, ensure:

- [ ] Soft delete checks are included (`isDeleted: false`)
- [ ] Types are properly defined (no `any`)
- [ ] i18next is used for all user-facing strings
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] React Query patterns are followed
- [ ] File organization matches project structure
- [ ] Naming conventions are followed
- [ ] Comments explain "why" not "what"
- [ ] Code is properly formatted
- [ ] Imports are organized correctly
- [ ] `#region` comments are used for logical grouping
- [ ] **Type checking passes: `npm run typecheck` runs without errors**
- [ ] UI components follow [Design System](../design/design-system.md) patterns
- [ ] Animations use established Framer Motion variants
- [ ] Hover effects are consistent with design system guidelines

## Common Mistakes to Avoid

1. **Missing Soft Delete Check**: Always include `eq(table.isDeleted, false)`
2. **Hardcoded Strings**: Always use i18next for user-facing strings
3. **Using `any` Type**: Always define proper types
4. **Missing Error Handling**: Always handle errors properly
5. **Missing Loading States**: Always show loading indicators
6. **N+1 Queries**: Use `db.query` with relations instead of multiple queries
7. **Missing Query Invalidation**: Always invalidate queries after mutations
8. **Incorrect Import Paths**: Use `@/` alias for internal imports
9. **Missing Type Exports**: Export types from API routes for use in services

## Examples

### Complete API Route Example

See: `src/app/api/incomes/route.ts`

### Complete Service Example

See: `src/lib/services/income.ts`

### Complete Schema Example

See: `src/lib/schemas/income/create-income-schema.ts`

### Complete Page Component Example

See: `src/app/[locale]/dashboard/incomes/page.tsx`

### Complete Sheet Component Example

See: `src/app/[locale]/dashboard/incomes/_components/CreateIncomeSheet.tsx`

## Working with the Codebase

### When Adding a New Feature

1. Create schema files in `src/lib/schemas/[resource]/`
2. Create API route in `src/app/api/[resource]/route.ts`
3. Create service file in `src/lib/services/[resource].ts`
4. Create page component in `src/app/[locale]/dashboard/[resource]/page.tsx`
5. Create form components in `_components/` directory
6. Add translation keys to `src/messages/`
7. **Run `npm run typecheck` to verify there are no type errors**

### When Refactoring

1. Maintain existing patterns
2. Don't change working code unnecessarily
3. Update types if structure changes
4. Update related components
5. Test thoroughly
6. **Run `npm run typecheck` to verify there are no type errors**

### When Fixing Bugs

1. Identify the root cause
2. Fix the issue following project patterns
3. Add error handling if missing
4. Add tests if possible
5. Update related code if needed
6. **Run `npm run typecheck` to verify there are no type errors**

## Agent Instructions

When working as the Developer Agent:

1. **Always follow project patterns** - Refer to existing code examples
2. **Maintain type safety** - Never use `any`, always define proper types
3. **Test your code** - Run `npm run typecheck` at the end of every code change
4. **Verify type checking** - Ensure `npm run typecheck` passes without errors before completing tasks
5. **Follow naming conventions** - Use established patterns for files, functions, and variables
6. **Use i18next** - Never hardcode user-facing strings
7. **Handle errors properly** - Always implement error handling
8. **Update related code** - When changing types or structures, update all related files
9. **Document your changes** - Use comments to explain "why" not "what"
10. **Follow design system** - Refer to [Design System](../design/design-system.md) for UI patterns, animations, and visual guidelines
11. **Implement consistent animations** - Use Framer Motion variants from the design system for all animations

**Critical**: Type checking with `npm run typecheck` is mandatory and must pass before any code changes are considered complete.

## Conclusion

The Developer Agent must follow these conventions strictly to maintain code consistency and quality. When in doubt, refer to existing code examples in the codebase, particularly in the `incomes` feature which serves as a reference implementation.

**Remember**: Always run `npm run typecheck` at the end of code changes to ensure there are no type errors.

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17  
**Language**: English (as per agent documentation standards)
