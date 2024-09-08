Current structure

```
Events
|-  Event1
|   |- User1
        |- Lead1
|   |- User2
|   |   |- Lead2
```

---

# Introduction

# Usage

# Config

## Pre-event

- Before each event, check the questions asked in the sign up page. Update `populateAttendeeTemplate` in [utils](/functions/src/utils.js) to match the questions asked.
- Compare the receipt printed out with the ID field. It should be given by `order_id` + `id` + 001

## Adding new users

- Add users to Firebase Authentication
- Update the `user` array in [UserContainer](/src/components/user/UserContainer.tsx)

## Deployment

```bash
npm run build
firebase deploy
```
