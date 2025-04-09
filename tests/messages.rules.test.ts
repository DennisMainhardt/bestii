// tests/messages.rules.test.ts
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  doc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  limit,
  type Firestore,
} from 'firebase/firestore'; // Import Firestore type
import {
  setupFirestoreTestEnvironment,
  teardownFirestoreTestEnvironment,
  getFirestoreAsUser,
  getFirestoreUnauthenticated,
  clearFirestoreData,
  setupData,
  getTestEnv,
} from './firestore.rules.helpers';

describe('Firestore Message Rules (/users/{userId}/messages/{messageId})', () => {
  // Define user IDs
  const user_123 = 'user_123';
  const other_user_456 = 'other_user_456';

  // Declare db instances
  let user123Db: ReturnType<typeof getFirestoreAsUser>;
  let unauthDb: ReturnType<typeof getFirestoreUnauthenticated>;
  // Declare variables to hold message IDs
  let user123MessageId: string;
  let otherUser456MessageId: string;

  beforeAll(async () => {
    await setupFirestoreTestEnvironment();
  });
  afterAll(async () => {
    await teardownFirestoreTestEnvironment();
  });

  // Get fresh db instances and setup data before each test
  beforeEach(async () => {
    user123Db = getFirestoreAsUser(user_123);
    unauthDb = getFirestoreUnauthenticated();

    // Use setupData to create messages and capture their IDs
    const ids = await setupData<{ user123Id: string; otherUserId: string }>(
      async (adminSetupDb) => {
        const user123Ref = await addDoc(
          collection(adminSetupDb, `users/${user_123}/messages`),
          {
            role: 'user',
            content: 'original',
            persona: 'raze',
            createdAt: serverTimestamp(),
          }
        );
        const otherUser456Ref = await addDoc(
          collection(adminSetupDb, `users/${other_user_456}/messages`),
          {
            role: 'user',
            content: 'other',
            persona: 'raze',
            createdAt: serverTimestamp(),
          }
        );
        return { user123Id: user123Ref.id, otherUserId: otherUser456Ref.id };
      }
    );
    // Assign the captured IDs
    user123MessageId = ids.user123Id;
    otherUser456MessageId = ids.otherUserId;
  });

  // --- Read Tests ---
  test('Test 11: Get Own Message (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertSucceeds(
      getDoc(doc(user123Db, `users/${user_123}/messages/${user123MessageId}`))
    );
  });
  test('Test 12: List Own Messages (Authenticated Owner)', async () => {
    await assertSucceeds(
      getDocs(collection(user123Db, `users/${user_123}/messages`))
    );
  });
  test("Test 13: Get Other's Message (Authenticated Non-Owner)", async () => {
    // Use the stored ID
    await assertFails(
      getDoc(
        doc(
          user123Db,
          `users/${other_user_456}/messages/${otherUser456MessageId}`
        )
      )
    );
  });
  test("Test 14: List Other's Messages (Authenticated Non-Owner)", async () => {
    await assertFails(
      getDocs(collection(user123Db, `users/${other_user_456}/messages`))
    );
  });
  test('Get Message (Unauthenticated)', async () => {
    // Use the stored ID
    await assertFails(
      getDoc(doc(unauthDb, `users/${user_123}/messages/${user123MessageId}`))
    );
  });
  test('List Messages (Unauthenticated)', async () => {
    await assertFails(
      getDocs(collection(unauthDb, `users/${user_123}/messages`))
    );
  });

  // --- Create Tests ---
  test('Test 15: Create Own Message (Authenticated Owner - Valid Data)', async () => {
    const messageData = {
      role: 'user',
      content: 'Hello!',
      persona: 'raze',
      createdAt: serverTimestamp(),
    };
    await assertSucceeds(
      addDoc(collection(user123Db, `users/${user_123}/messages`), messageData)
    );
  });
  test('Test 16: Create Own Message (Authenticated Owner - Invalid Role)', async () => {
    const messageData = {
      role: 'admin',
      content: 'Test',
      persona: 'raze',
      createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(collection(user123Db, `users/${user_123}/messages`), messageData)
    );
  });
  test('Test 17: Create Own Message (Authenticated Owner - Missing Field: content)', async () => {
    const messageData = {
      role: 'user',
      /* content missing */ persona: 'raze',
      createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(collection(user123Db, `users/${user_123}/messages`), messageData)
    );
  });
  test('Create Own Message (Authenticated Owner - Missing Field: persona)', async () => {
    const messageData = {
      role: 'user',
      content: 'Hi',
      /* persona missing */ createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(collection(user123Db, `users/${user_123}/messages`), messageData)
    );
  });
  test('Create Own Message (Authenticated Owner - Client Timestamp)', async () => {
    const messageData = {
      role: 'user',
      content: 'Hi',
      persona: 'raze',
      createdAt: new Date(),
    };
    await assertFails(
      addDoc(collection(user123Db, `users/${user_123}/messages`), messageData)
    );
  });
  test('Create Message for Another User (Authenticated)', async () => {
    const messageData = {
      role: 'user',
      content: 'Valid',
      persona: 'raze',
      createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(
        collection(user123Db, `users/${other_user_456}/messages`),
        messageData
      )
    );
  });
  test('Create Message (Unauthenticated)', async () => {
    const messageData = {
      role: 'user',
      content: 'Valid',
      persona: 'raze',
      createdAt: serverTimestamp(),
    };
    await assertFails(
      addDoc(collection(unauthDb, `users/${user_123}/messages`), messageData)
    );
  });

  // --- Update Tests ---
  test('Test 18: Update Own Message (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertFails(
      updateDoc(
        doc(user123Db, `users/${user_123}/messages/${user123MessageId}`),
        {
          content: 'Updated',
        }
      )
    );
  });

  // --- Delete Tests ---
  test('Test 19: Delete Own Message (Authenticated Owner)', async () => {
    // Use the stored ID
    await assertFails(
      deleteDoc(
        doc(user123Db, `users/${user_123}/messages/${user123MessageId}`)
      )
    );
  });
});
