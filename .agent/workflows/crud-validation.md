---
description: How to implement CRUD with robust validation (anti-null error)
---

This workflow ensures that CRUD operations in this project do not suffer from the "Invalid input: expected string, received null" validation error when using Zod and FormData.

### 1. Prisma Schema
Ensure optional fields are marked with `?`.
```prisma
model MyModel {
  id          String  @id @default(uuid())
  description String?
}
```

### 2. Server Action (Schema)
Always use `.nullish()` for optional string fields to accept `null`, `undefined`, or `string`.
```typescript
const mySchema = z.object({
  description: z.string().nullish(),
});
```

### 3. Server Action (Parsing)
When parsing `formData.get()`, explicitly convert empty/null values to `null` before passing to Zod.
```typescript
async function createMyModel(formData: FormData) {
  const description = formData.get('description') as string;
  
  const validated = mySchema.safeParse({
    description: description || null, // Convert "" or null to null
  });
  
  if (!validated.success) return { error: validated.error.issues[0].message };
  
  // Prisma handles `null` correctly for optional fields
  await prisma.myModel.create({
    data: { description: validated.data.description }
  });
}
```

### 4. Frontend Form
Initialize optional fields with `undefined` if the database value is `null`.
```typescript
const form = useForm<FormValues>({
  defaultValues: {
    description: defaultValues?.description || undefined,
  },
});
```

### 5. Form Submission
Conditionally append optional fields to `FormData`.
```typescript
async function onSubmit(values: FormValues) {
  const formData = new FormData();
  if (values.description) formData.append("description", values.description);
}
```
