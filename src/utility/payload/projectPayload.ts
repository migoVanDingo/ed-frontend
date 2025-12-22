// src/utils/projectPayload.ts

export interface CreateProjectFormValues {
  name: string;
  description?: string;
  status?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  status?: string;
  datastoreId: string;
  organizationId?: string;
}

/**
 * Build the payload to send to your GraphQL mutation / backend
 * from the raw form values + context (current datastore, owner, org).
 *
 * Adjust key casing (camel vs snake) to match your API.
 */
export function buildCreateProjectPayload(
  formValues: CreateProjectFormValues,
  context: {
    datastoreId: string;
    organizationId?: string;
  }
): CreateProjectPayload {
  const { name, description, status } = formValues;
  const { datastoreId, organizationId } = context;

  return {
    name: name.trim(),
    description: description?.trim() || null,
    status: status ?? "active",
    datastoreId,
    organizationId,
  };
}
