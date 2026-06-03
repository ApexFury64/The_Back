// Mock Prisma Client to prevent build errors on unmigrated routes
// We are migrating to Firestore.
const mockHandler = {
  get(target: any, prop: string): any {
    if (prop === '$connect' || prop === '$disconnect') return async () => {};
    if (prop === 'user') return { count: async () => 0 };
    return new Proxy({}, {
      get() {
        return async () => []; // Return empty array for findMany, findUnique, etc.
      }
    });
  }
};

export const prisma = new Proxy({}, mockHandler) as any;
