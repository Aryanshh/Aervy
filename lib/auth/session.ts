import { Role, AuthContextUser } from "@/lib/permissions/can";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationIds: string[];
  isActive: boolean;
}

export function toAuthContextUser(user: SessionUser): AuthContextUser {
  return {
    id: user.id,
    role: user.role,
    organizationIds: user.organizationIds,
    isActive: user.isActive,
  };
}

/**
 * Validates whether an email format conforms to standard syntax.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
