# Security Specification - ArchClock

## Data Invariants
1. Users can only read and write their own profile document.
2. Users can only create attendance records where `userId` matches their authenticated UID.
3. Users can read their own attendance records.
4. Admins can read all attendance records.
5. `timestamp` must be the server time.
6. `type` must be either 'clock_in' or 'clock_out'.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating an attendance record for another user's UID.
2. Modifying another user's profile.
3. Clocking in with a fake timestamp (non-server time).
4. Updating an existing attendance record (they should be immutable logs).
5. Deleting an attendance record.
6. Setting an admin role for oneself during creation.
7. Injecting 1MB junk into the `note` field.
8. Listing all attendance records as a non-admin.
9. Creating a record with an invalid `type`.
10. Creating a record without a `userId`.
11. Reading another user's profile PII.
12. Creating a record with an excessively large `siteName`.

## Security Rules Implementation (Draft)
I will implement rules that enforce:
- `request.auth.uid == userId` for `/attendance` creation.
- `request.resource.data.timestamp == request.time`.
- `resource.data.userId == request.auth.uid` for listing own records.
- Immutable attendance logs (no `update` or `delete`).
