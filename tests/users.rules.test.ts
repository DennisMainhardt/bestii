// tests/users.rules.test.ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
// Import types from main firebase/firestore only if needed for data structuring, not for db instances
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  setupFirestoreTestEnvironment,
  teardownFirestoreTestEnvironment,
  getFirestoreAsUser,
  getFirestoreUnauthenticated,
  clearFirestoreData,
  setupData, // Use setup helper
} from './firestore.rules.helpers';

describe('Firestore User Profile Rules (/users/{userId})', () => {
  // Define user IDs
  const user_123 = 'user_123';
  const other_user_456 = 'other_user_456';

  // Declare db instances, let TypeScript infer the type from helpers
  let user123Db: ReturnType<typeof getFirestoreAsUser>;
  let unauthDb: ReturnType<typeof getFirestoreUnauthenticated>;

  // Setup test environment before all tests in this suite
  beforeAll(async () => {
    await setupFirestoreTestEnvironment();
  });

  // Get fresh db instances before each test
  beforeEach(async () => {
    user123Db = getFirestoreAsUser(user_123);
    unauthDb = getFirestoreUnauthenticated();
    // Ensure a clean slate for these specific users before setting data
    await setupData<void>(async (adminDb) => {
      // Explicitly delete first to handle potential leftovers without full clear
      try {
        await deleteDoc(doc(adminDb, `users/${user_123}`));
        await deleteDoc(doc(adminDb, `users/${other_user_456}`));
      } catch (e) {
        // Ignore errors if docs didn't exist
        if (!(e instanceof Error && e.message.includes('NOT_FOUND'))) {
          throw e;
        }
      }

      // Now set the documents
      await setDoc(doc(adminDb, `users/${user_123}`), {
        uid: user_123,
        email: 'original@example.com',
        displayName: 'Original Name',
        providerId: 'password',
        createdAt: new Date(2024, 0, 1),
        lastLoginAt: new Date(2024, 0, 1),
      });
      await setDoc(doc(adminDb, `users/${other_user_456}`), {
        uid: other_user_456,
        email: 'other@example.com',
        displayName: 'Other Name',
        providerId: 'google.com',
        createdAt: new Date(2024, 0, 1),
        lastLoginAt: new Date(2024, 0, 1),
      });
      return;
    });
  });

  // Tear down test environment after all tests in this suite
  afterAll(async () => {
    await teardownFirestoreTestEnvironment();
  });

  // Clear data between individual tests to ensure isolation
  // Commenting out as it seems to cause race conditions with beforeEach
  // afterEach(async () => {
  //   await clearFirestoreData();
  // });

  // --- Read Tests (get) ---
  test('Test 1: Get Own Profile (Authenticated Owner)', async () => {
    await assertSucceeds(getDoc(doc(user123Db, `users/${user_123}`)));
  });
  test('Test 2: Get Other Profile (Authenticated Non-Owner)', async () => {
    await assertFails(getDoc(doc(user123Db, `users/${other_user_456}`)));
  });
  test('Test 3: Get Profile (Unauthenticated)', async () => {
    await assertFails(getDoc(doc(unauthDb, `users/${user_123}`)));
  });

  // --- Read Tests (list) ---
  test('Test 4: List Users Collection (Authenticated)', async () => {
    await assertFails(getDocs(collection(user123Db, `users`)));
  });
  test('List Users Collection (Unauthenticated)', async () => {
    await assertFails(getDocs(collection(unauthDb, `users`)));
  });

  // --- Create Tests ---
  test('Test 5: Create Own Profile (Authenticated Owner - Valid Data)', async () => {
    await clearFirestoreData(); // Clear setup data for clean create test
    const profileData = {
      uid: user_123,
      email: 'test@example.com',
      displayName: 'Test User',
      providerId: 'google.com',
      credits: 5,
      monthlyResets: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastCreditReset: serverTimestamp(),
      monthlyCycleStart: serverTimestamp(),
    };
    await assertSucceeds(
      setDoc(doc(user123Db, `users/${user_123}`), profileData)
    );
  });
  test('Test 6: Create Own Profile (Authenticated Owner - Missing Required Field)', async () => {
    await clearFirestoreData();
    const profileData = {
      uid: user_123,
      email: 'test@example.com' /* displayName MISSING */,
      providerId: 'google.com',
      credits: 5,
      monthlyResets: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastCreditReset: serverTimestamp(),
      monthlyCycleStart: serverTimestamp(),
    };
    await assertFails(setDoc(doc(user123Db, `users/${user_123}`), profileData));
  });
  test('Test 7: Create Own Profile (Authenticated Owner - Incorrect UID Field)', async () => {
    await clearFirestoreData();
    const profileData = {
      uid: 'different_uid',
      email: 'test@example.com',
      displayName: 'Test User',
      providerId: 'google.com',
      credits: 5,
      monthlyResets: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastCreditReset: serverTimestamp(),
      monthlyCycleStart: serverTimestamp(),
    };
    await assertFails(setDoc(doc(user123Db, `users/${user_123}`), profileData));
  });
  test('Create Profile for Another User (Authenticated)', async () => {
    const profileData = {
      uid: other_user_456,
      email: 'other@example.com',
      displayName: 'Other User',
      providerId: 'password',
      credits: 5,
      monthlyResets: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastCreditReset: serverTimestamp(),
      monthlyCycleStart: serverTimestamp(),
    };
    await assertFails(
      setDoc(doc(user123Db, `users/${other_user_456}`), profileData)
    ); // Try to write as user_123
  });
  test('Create Profile (Unauthenticated)', async () => {
    await clearFirestoreData();
    const profileData = {
      uid: user_123,
      email: 'test@example.com',
      displayName: 'Test User',
      providerId: 'google.com',
      credits: 5,
      monthlyResets: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastCreditReset: serverTimestamp(),
      monthlyCycleStart: serverTimestamp(),
    };
    await assertFails(setDoc(doc(unauthDb, `users/${user_123}`), profileData));
  });

  // --- Update Tests --- (Rely on beforeEach setup)
  test('Test 8: Update Own Profile (Authenticated Owner - Allowed Fields)', async () => {
    await assertSucceeds(
      updateDoc(doc(user123Db, `users/${user_123}`), {
        displayName: 'Updated Name',
        lastLoginAt: serverTimestamp(),
        photoURL: 'http://example.com/photo.jpg',
      })
    );
  });
  test('Test 9: Update Own Profile (Authenticated Owner - Disallowed Field: email)', async () => {
    await assertFails(
      updateDoc(doc(user123Db, `users/${user_123}`), {
        email: 'new@example.com',
      })
    );
  });
  test('Update Own Profile (Authenticated Owner - Disallowed Field: createdAt)', async () => {
    await assertFails(
      updateDoc(doc(user123Db, `users/${user_123}`), {
        createdAt: serverTimestamp(),
      })
    );
  });
  test('Update Own Profile (Authenticated Owner - Disallowed Field: uid)', async () => {
    await assertFails(
      updateDoc(doc(user123Db, `users/${user_123}`), {
        uid: 'cannot_change_uid',
      })
    );
  });
  test('Update Own Profile (Authenticated Owner - Disallowed Field: providerId)', async () => {
    await assertFails(
      updateDoc(doc(user123Db, `users/${user_123}`), {
        providerId: 'new_provider',
      })
    );
  });
  test('Update Other User Profile (Authenticated)', async () => {
    await assertFails(
      updateDoc(doc(user123Db, `users/${other_user_456}`), {
        displayName: 'Hacked Name',
      })
    );
  });
  test('Update Profile (Unauthenticated)', async () => {
    await assertFails(
      updateDoc(doc(unauthDb, `users/${user_123}`), {
        displayName: 'Updated Name',
      })
    );
  });

  // --- Delete Tests ---
  test('Test 10: Delete Own Profile (Authenticated Owner)', async () => {
    await assertFails(deleteDoc(doc(user123Db, `users/${user_123}`)));
  });
  test('Delete Other Profile (Authenticated)', async () => {
    await assertFails(deleteDoc(doc(user123Db, `users/${other_user_456}`)));
  });
  test('Delete Profile (Unauthenticated)', async () => {
    await assertFails(deleteDoc(doc(unauthDb, `users/${user_123}`)));
  });
});
