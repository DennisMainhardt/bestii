// tests/personas.rules.test.ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  collection,
  getDocs,
  query,
  limit,
  type Firestore,
} from 'firebase/firestore';
import {
  setupFirestoreTestEnvironment,
  teardownFirestoreTestEnvironment,
  getFirestoreAsUser,
  getFirestoreUnauthenticated,
  clearFirestoreData,
  setupData,
  getTestEnv,
} from './firestore.rules.helpers';

describe('Firestore Persona Data Rules (/users/{userId}/personas/{personaId}/...)', () => {
  // Define IDs
  const user_123 = 'user_123';
  const other_user_456 = 'other_user_456';
  const personaId = 'raze';
  const metadataDocName = 'metadata';

  // Declare DB instances
  let user123Db: ReturnType<typeof getFirestoreAsUser>;
  let unauthDb: ReturnType<typeof getFirestoreUnauthenticated>;
  // Declare variables to hold summary IDs
  let user123SummaryId: string;
  let otherUser456SummaryId: string;

  beforeAll(async () => {
    await setupFirestoreTestEnvironment();
  });
  afterAll(async () => {
    await teardownFirestoreTestEnvironment();
  });
  // afterEach(async () => {
  //   await clearFirestoreData();
  // });

  // Get instances and setup data before each
  beforeEach(async () => {
    user123Db = getFirestoreAsUser(user_123);
    unauthDb = getFirestoreUnauthenticated();

    // Ensure clean slate for these specific docs before setting/adding data
    const ids = await setupData<{
      user123SummaryId: string;
      otherUser456SummaryId: string;
    }>(async (adminSetupDb) => {
      // Explicitly delete metadata first
      const user123MetadataRef = doc(
        adminSetupDb,
        `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
      );
      const otherUser456MetadataRef = doc(
        adminSetupDb,
        `users/${other_user_456}/personas/${personaId}/session/${metadataDocName}`
      );
      try {
        await deleteDoc(user123MetadataRef);
        await deleteDoc(otherUser456MetadataRef);
      } catch (e) {
        // Ignore not found errors
        if (!(e instanceof Error && e.message.includes('NOT_FOUND'))) {
          throw e;
        }
      }
      // Note: We don't explicitly delete summaries as addDoc creates new ones,
      // but clearing metadata ensures consistent start for metadata tests.

      // User 123 Data
      const user123SummaryRef = await addDoc(
        collection(
          adminSetupDb,
          `users/${user_123}/personas/${personaId}/summaries`
        ),
        { summary: 'original summary', createdAt: serverTimestamp() }
      );
      await setDoc(user123MetadataRef, {
        // Use ref from above
        lastSummarizedMessageTimestamp: null,
      });

      // Other User Data
      const otherUser456SummaryRef = await addDoc(
        collection(
          adminSetupDb,
          `users/${other_user_456}/personas/${personaId}/summaries`
        ),
        { summary: 'other summary', createdAt: serverTimestamp() }
      );
      await setDoc(otherUser456MetadataRef, {
        // Use ref from above
        lastSummarizedMessageTimestamp: null,
      });

      // Return the captured IDs
      return {
        user123SummaryId: user123SummaryRef.id,
        otherUser456SummaryId: otherUser456SummaryRef.id,
      };
    });
    // Assign IDs to variables
    user123SummaryId = ids.user123SummaryId;
    otherUser456SummaryId = ids.otherUser456SummaryId;
  });

  // --- Summaries Read Tests ---

  test('Test 20a: Get Own Summary (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertSucceeds(
      getDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries/${user123SummaryId}`
        )
      )
    );
  });

  test('Test 20b: List Own Summaries (Authenticated Owner)', async () => {
    await assertSucceeds(
      getDocs(
        collection(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries`
        )
      )
    );
  });

  test("Test 21a: Get Other's Summary (Authenticated Non-Owner)", async () => {
    // Use the stored ID
    await assertFails(
      getDoc(
        doc(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/summaries/${otherUser456SummaryId}`
        )
      )
    );
  });

  test("Test 21b: List Other's Summaries (Authenticated Non-Owner)", async () => {
    await assertFails(
      getDocs(
        collection(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/summaries`
        )
      )
    );
  });

  test('Get/List Summaries (Unauthenticated)', async () => {
    // Use the stored ID for the get test part
    await assertFails(
      getDoc(
        doc(
          unauthDb,
          `users/${user_123}/personas/${personaId}/summaries/${user123SummaryId}`
        )
      )
    );
    await assertFails(
      getDocs(
        collection(
          unauthDb,
          `users/${user_123}/personas/${personaId}/summaries`
        )
      )
    );
  });

  // --- Summaries Create Tests ---

  test('Test 22: Create Own Summary (Authenticated Owner - Valid Data)', async () => {
    const summaryData = {
      summary: 'Valid summary text',
      createdAt: serverTimestamp(),
    };
    await assertSucceeds(
      addDoc(
        collection(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries`
        ),
        summaryData
      )
    );
  });

  test('Test 23: Create Own Summary (Authenticated Owner - Missing Field)', async () => {
    const summaryData = { /* summary missing */ createdAt: serverTimestamp() };
    await assertFails(
      addDoc(
        collection(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries`
        ),
        summaryData
      )
    );
  });

  test('Create Own Summary (Authenticated Owner - Client Timestamp)', async () => {
    const summaryData = {
      summary: 'Valid summary text',
      createdAt: new Date(),
    }; // Client time
    await assertFails(
      addDoc(
        collection(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries`
        ),
        summaryData
      )
    );
  });

  test('Create Summary for Another User (Authenticated)', async () => {
    const summaryData = {
      summary: 'Valid summary text',
      createdAt: serverTimestamp(),
    };
    // Trying to write as user_123 to other_user_456's path
    await assertFails(
      addDoc(
        collection(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/summaries`
        ),
        summaryData
      )
    );
  });

  test('Create Summary (Unauthenticated)', async () => {
    const summaryData = {
      summary: 'Valid summary text',
      createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(
        collection(
          unauthDb,
          `users/${user_123}/personas/${personaId}/summaries`
        ),
        summaryData
      )
    );
  });

  // --- Summaries Update/Delete Tests ---

  test('Test 24: Update Own Summary (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertFails(
      updateDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries/${user123SummaryId}`
        ),
        { summary: 'Updated' }
      )
    );
  });

  test('Test 25: Delete Own Summary (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertFails(
      deleteDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/summaries/${user123SummaryId}`
        )
      )
    );
  });

  // --- Metadata Read Tests ---

  test('Test 26: Get Own Metadata (Authenticated Owner)', async () => {
    await assertSucceeds(
      getDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        )
      )
    );
  });

  test("Test 27: Get Other's Metadata (Authenticated Non-Owner)", async () => {
    await assertFails(
      getDoc(
        doc(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/session/${metadataDocName}`
        )
      )
    );
  });

  test('Get Metadata (Unauthenticated)', async () => {
    await assertFails(
      getDoc(
        doc(
          unauthDb,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        )
      )
    );
  });

  // --- Metadata Create Tests --- (Create might fail if setup already created it, test update instead)

  test('Test 28: Create Own Metadata (Authenticated Owner - Valid Initial State)', async () => {
    // Clear specific doc first if setup creates it
    await setupData<void>(async (adminSetupDb) => {
      await deleteDoc(
        doc(
          adminSetupDb,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        )
      );
      return;
    });
    await assertSucceeds(
      setDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  test('Create Own Metadata (Authenticated Owner - Invalid Initial State)', async () => {
    await setupData<void>(async (adminSetupDb) => {
      await deleteDoc(
        doc(
          adminSetupDb,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        )
      );
      return;
    });
    await assertFails(
      setDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: 'not a timestamp', // Invalid type
        }
      )
    );
  });

  test('Create Metadata for Another User (Authenticated)', async () => {
    await assertFails(
      setDoc(
        doc(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  test('Create Metadata (Unauthenticated)', async () => {
    await assertFails(
      setDoc(
        doc(
          unauthDb,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  // --- Metadata Update Tests ---

  test('Test 29: Update Own Metadata (Authenticated Owner - Allowed Field: Timestamp)', async () => {
    await assertSucceeds(
      updateDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: serverTimestamp(),
        }
      )
    );
  });

  test('Test 30: Update Own Metadata (Authenticated Owner - Allowed Field: Null)', async () => {
    await assertSucceeds(
      updateDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  test('Test 31: Update Own Metadata (Authenticated Owner - Disallowed Field)', async () => {
    await assertFails(
      updateDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
          anotherField: 'test',
        }
      )
    );
  });

  test('Update Own Metadata (Authenticated Owner - Invalid Type)', async () => {
    await assertFails(
      updateDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: 'not a timestamp or null',
        }
      )
    );
  });

  test('Update Other User Metadata (Authenticated)', async () => {
    await assertFails(
      updateDoc(
        doc(
          user123Db,
          `users/${other_user_456}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  test('Update Metadata (Unauthenticated)', async () => {
    await assertFails(
      updateDoc(
        doc(
          unauthDb,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        ),
        {
          lastSummarizedMessageTimestamp: null,
        }
      )
    );
  });

  // --- Metadata Delete Tests ---

  test('Test 32: Delete Own Metadata (Authenticated Owner)', async () => {
    await assertFails(
      deleteDoc(
        doc(
          user123Db,
          `users/${user_123}/personas/${personaId}/session/${metadataDocName}`
        )
      )
    );
  });
});
