# Security Specification - SoleSphere

## Data Invariants
1. A product must have a name, brand, and positive price.
2. An order must have customer details (name, phone, address, email) and a total > 0.
3. Order status can only be updated to a terminal state (Completed/Cancelled), after which no further updates are allowed.
4. Only specific fields in a product can be updated (stock, price, discount, name, brand, category, description, rating, reviews, variants).
5. Only specific fields in an order can be updated (status, updatedAt).

## The Dirty Dozen Payloads

### Product Attacks
1. **Shadow Field Injection**: Create product with `{"isVerified": true}`.
2. **Identity Spoofing**: Attempt to delete a product without admin privileges.
3. **Price Poisoning**: Update product price to -100.
4. **ID Poisoning**: Create product with ID that is 2KB of random characters.
5. **Rating Manipulation**: Update rating to 10.0 (max 5.0).

### Order Attacks
6. **Blanket Read Request**: Try to list all orders as an unauthenticated user.
7. **PII Leak**: Try to `get` an order by ID as a different user (note: orders are currently public in this draft, but we should restrict by ID or email).
8. **Status Jumping**: Update order status from 'Processing' to 'Completed' without going through intermediate steps (if applicable) or by a non-admin.
9. **Total Tampering**: Update order `total` to 0 after creation.
10. **Shadow Key Injection**: Add `isPaid: true` to an order via client update.
11. **Email Spoofing**: Create order with someone else's email and try to read it back (note: these rules don't use auth for orders yet, but we'll harden).
12. **Timestamp Forgery**: Create order with a `date` in the future.

## Test Runner (Conceptual)
All the above payloads should return `PERMISSION_DENIED` when attempted via client SDK.
