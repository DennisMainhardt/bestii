// tests/firestore.rules.helpers.ts
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
// Import the actual Firestore type for function signatures where needed
import { Firestore } from 'firebase/firestore';

let testEnvInstance: RulesTestEnvironment | null = null;

// Define your Firestore project ID used for testing
// MAKE SURE TO REPLACE THIS!
const FIRESTORE_PROJECT_ID = 'chatbot-2ff8e';

export const setupFirestoreTestEnvironment =
  async (): Promise<RulesTestEnvironment> => {
    if (testEnvInstance) {
      await testEnvInstance.cleanup();
    }
    testEnvInstance = await initializeTestEnvironment({
      projectId: FIRESTORE_PROJECT_ID,
      firestore: {
        rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
        host: 'localhost',
        port: 8080,
      },
    });
    return testEnvInstance;
  };

export const getTestEnv = (): RulesTestEnvironment => {
  if (!testEnvInstance) {
    throw new Error(
      'Test environment not initialized. Call setupFirestoreTestEnvironment first.'
    );
  }
  return testEnvInstance;
};

export const teardownFirestoreTestEnvironment = async () => {
  await testEnvInstance?.cleanup();
  testEnvInstance = null;
};

// Gets a Firestore instance authenticated as a specific user
// Let TypeScript infer the return type from the library function
export const getFirestoreAsUser = (userId: string) => {
  return getTestEnv().authenticatedContext(userId).firestore();
};

// Gets a Firestore instance for an unauthenticated user
export const getFirestoreUnauthenticated = () => {
  return getTestEnv().unauthenticatedContext().firestore();
};

// Gets a Firestore instance that bypasses security rules (for setup/teardown)
export const getFirestoreAsAdmin = () => {
  return getTestEnv()
    .authenticatedContext('admin-user', { admin: true })
    .firestore();
};

// Clears all data in the Firestore emulator
export const clearFirestoreData = async () => {
  await getTestEnv()?.clearFirestore();
};

// Helper to quickly run setup operations bypassing rules if needed
// Use the actual Firestore type for the callback parameter
// Add generic type T for the return value
export async function setupData<T>(
  setupFn: (adminDb: Firestore) => Promise<T>
): Promise<T> {
  let capturedResult: T | undefined;
  // Use ! assertion as testEnvInstance is checked in getTestEnv
  await getTestEnv()!.withSecurityRulesDisabled(async (context) => {
    // Keep the cast as the types are incompatible
    capturedResult = await setupFn(context.firestore() as unknown as Firestore);
  });
  // Remove the check for undefined. If T is void, undefined is the expected result.
  // If T is not void and result is undefined, the caller will handle it.
  return capturedResult as T; // Need to cast back to T as capturedResult is T | undefined
}
