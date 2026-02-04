# UI Form Patterns

DECISION STATUS: **ACCEPTED**

## Overview

Super Impress forms use a combination of TanStack Form for validation and TanStack Query for mutations, with deliberate patterns to prevent common UX issues like duplicate submissions and race conditions.

## Spam Prevention Pattern

### The Problem

Users can accidentally (or intentionally) submit forms multiple times by repeatedly clicking the submit button. This causes:
- Duplicate API requests
- Race conditions
- Inconsistent state
- Wasted server resources
- Poor user experience

### The Solution

Disable form controls during submission by tracking the mutation's pending state.

**Implementation** (from `frontend/src/features/auth/register/register.tsx`):

```tsx
<fieldset disabled={registerMutation.isPending}>
  {/* All form inputs and submit button here */}
</fieldset>
```

### How It Works

1. **User submits form**: `registerMutation.mutate(value)` is called
2. **Mutation starts**: `registerMutation.isPending` becomes `true`
3. **Fieldset disables**: The `disabled` attribute disables all form controls
4. **User blocked**: Cannot type, click submit, or interact with any field
5. **Mutation completes**: `isPending` becomes `false`, form re-enables

### Why Fieldset Instead of Just the Button

Disabling only the submit button is insufficient:
- Users can still modify form data while request is in-flight
- Changed data creates inconsistent UI state
- Doesn't clearly communicate "form is processing"

Disabling the entire `<fieldset>` provides:
- Clear visual feedback (browser dims disabled controls)
- Prevents any form interaction during submission
- Single binding point - no need to disable each input individually
- Native HTML behavior - no custom state management

### Visual Feedback

The submit button shows loading state:

```tsx
<Button type="submit" aria-busy={registerMutation.isPending}>
  {registerMutation.isPending ? 'Registering...' : 'Register'}
</Button>
```

This provides:
- Text changes from "Register" to "Registering..."
- `aria-busy` attribute for screen readers
- Clear indication that work is happening

## Form State Management

### TanStack Form

Used for client-side validation and form state:

```tsx
const form = useForm({
  defaultValues: { email: '', password: '', confirmPassword: '' },
  validators: { onSubmit: registerFormSchema },
  onSubmit: async ({ value }) => {
    registerMutation.mutate(value);
  }
});
```

**Responsibilities:**
- Field-level validation with Zod schemas
- Touch/dirty state tracking
- Error message display
- Form submission handling

### TanStack Query Mutation

Used for server communication and async state:

```tsx
const registerMutation = useMutation({
  mutationFn: registerApi,
  onSuccess: () => {
    navigate('/login');
  }
});
```

**Responsibilities:**
- API request lifecycle (pending, success, error)
- Automatic retries and error handling
- Success/error callbacks
- Request deduplication

### Why Both Libraries?

TanStack Form and TanStack Query have distinct, complementary roles:

- **Form**: Client-side validation, field state, UX
- **Query**: Server communication, async state, caching

Using both provides:
- Clear separation of concerns
- Best-in-class solutions for each domain
- Reactive state that works seamlessly together

## Benefits

### For Users
- Cannot accidentally submit forms multiple times
- Clear visual feedback during submission
- Consistent, predictable behavior
- Accessible loading states

### For Developers
- Simple implementation (one `disabled` binding)
- No custom debouncing or state management needed
- Leverages native HTML `<fieldset>` behavior
- Automatic with TanStack Query's `isPending` state
- Consistent pattern across all forms

### For System
- Prevents duplicate API requests
- Reduces server load
- Avoids race conditions
- Cleaner error handling (one request at a time)

## Accessibility

The pattern includes proper ARIA attributes:

- `aria-invalid` on inputs with validation errors
- `aria-busy` on submit button during submission
- `role="alert"` for error messages
- `aria-live="polite"` for dynamic error announcements

Screen readers announce:
- Field validation errors as users type
- Form submission in progress
- Success or error after submission completes

## Related Patterns

This decision is related to:
- `/decisions/tech/4-ui-component-architecture.md` - UI components used in forms

## References

### Code Examples
- `/frontend/src/features/auth/register/register.tsx` - Registration form implementation
- `/frontend/src/features/auth/login/login.tsx` - Login form (same pattern)

### Documentation
- [TanStack Form](https://tanstack.com/form/latest) - Form validation and state management
- [TanStack Query](https://tanstack.com/query/latest) - Async state and mutations
- [MDN: fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset) - Native HTML fieldset element
- [ARIA: busy state](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy) - Accessibility for loading states
