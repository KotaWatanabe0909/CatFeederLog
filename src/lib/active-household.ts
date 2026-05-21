import { cookies } from "next/headers";

const COOKIE = "active_household_id";

type Membership = { id: string; household_id: string };

export async function getActiveMembership<T extends Membership>(
  memberships: T[]
): Promise<T | null> {
  if (!memberships.length) return null;
  const store = await cookies();
  const stored = store.get(COOKIE)?.value;
  return memberships.find((m) => m.household_id === stored) ?? memberships[0];
}

export async function setActiveHousehold(householdId: string) {
  const store = await cookies();
  store.set(COOKIE, householdId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });
}
