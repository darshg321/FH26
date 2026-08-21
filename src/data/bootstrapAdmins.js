/**
 * Admins hardcoded in firestore.rules rather than stored in the /admins
 * collection. Firestore is the thing that enforces them — this list only
 * exists so /admin can show them instead of leaving a confusing gap.
 *
 * Changing who is an admin here means editing firestore.rules AND redeploying
 * (`firebase deploy --only firestore:rules`). Everyone else can be managed from
 * the /admin page directly.
 */
export const BOOTSTRAP_ADMINS = ["darshg321@gmail.com"];
