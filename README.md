# FraserHacks 2026

the home of john fraser's 2026 hackathon!
ran on march 26, 2026 with over 100 people!

team:

co-leads:
- darsh gupta
- james lian

assistant directors:
- rachael lu
- jia peng

tech:
- jason chou

finance:
- irene wang

logistics:
- danny kenneth

## 2027 interest list

the hero has a "hacker interest form" button that writes a signup (name, email,
grade, school) to the `interest2027` firestore collection. `/admin` shows those
signups as a sortable table with csv export.

signups are private, so access is enforced by firestore, not by the page:

- `/admin` is google sign-in only. a signed-in account gets in if it's in the
  bootstrap list at the top of `firestore.rules`, or if
  `admins/<their lowercased email>` exists in firestore. that check lives in the
  rules, so a non-admin gets nothing back even if they load the page.
- add or remove admins from the bottom of `/admin` itself. the bootstrap ones
  are shown there but can only be changed by editing `firestore.rules` (and
  `src/data/bootstrapAdmins.js`, which just mirrors it for display).

setup, once:

1. firebase console > authentication > sign-in method > enable google. add your
   deploy domains under authorized domains (localhost is there by default,
   the vercel/custom domain is not).
2. deploy the rules: `npx firebase deploy --only firestore:rules` (or paste
   `firestore.rules` into firestore > rules).

if signups fail with "missing or insufficient permissions", the rules in step 2
aren't live yet.

nothing else in firestore is reachable from the site — the 2026
`registrationsBySchool` data is console-only now.
