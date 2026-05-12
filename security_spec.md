# Photo Gallery Security Specification

## Data Invariants
1. A photo must always have an `ownerId` that matches the authenticated user.
2. A photo's `url` must be a valid string.
3. Users can only see/edit/delete their own photos and albums.
4. `createdAt` must be set to server time upon creation and remains immutable.
5. `updatedAt` must be updated on any modification.

## The Dirty Dozen Payloads (Target: /photos/{photoId})

1. **Identity Spoofing**: Attempt to create a photo with another user's UID as `ownerId`.
2. **Ghost Field**: Attempt to update a photo with a field not in the schema (e.g., ` isAdmin: true `).
3. **Resource Poisoning**: Attempt to use an extremely long string (>1MB) for the photo ID.
4. **Missing Required Field**: Attempt to create a photo without a `url`.
5. **Unauthorized Access**: Attempt to read a photo belonging to another user.
6. **Immutable Field Write**: Attempt to change `createdAt` during an update.
7. **Cross-User Deletion**: Attempt to delete a photo owned by another user.
8. **Invalid Type**: Attempt to set `width` to a string instead of a number.
9. **Status Shortcutting**: (Not applicable but for consistency) Attempt to skip an validation process.
10. **Query Scrape**: Attempt to list all photos without filtering by `ownerId`.
11. **Timestamp Spoof**: Attempt to provide a client-side timestamp for `createdAt` instead of server time.
12. **Album Hijacking**: Attempt to associate a photo with an album owned by another user.

## Test Runner (firestore.rules.test.ts)

(Placeholder: Logic will be verified by the generated rules in firestore.rules)
