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
  datastore_id: string;
  organization_id?: string;
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
    datastore_id: string;
    organization_id?: string;
  }
): CreateProjectPayload {
  const { name, description, status } = formValues;
  const { datastore_id, organization_id } = context;

  return {
    name: name.trim(),
    description: description?.trim() || null,
    status: status ?? "active",
    datastore_id,
    organization_id,
  };
}
