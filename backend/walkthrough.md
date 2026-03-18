# Sprint 2 Walkthrough — Backend Implementation

## What Was Built

Starting from an empty backend scaffold (only [server.js](file:///Users/sathvik/wayne/fox/No-Code-Form-Builder-And-Workflow/backend/src/server.js), [app.js](file:///Users/sathvik/wayne/fox/No-Code-Form-Builder-And-Workflow/backend/src/app.js), [db.js](file:///Users/sathvik/wayne/fox/No-Code-Form-Builder-And-Workflow/backend/src/db/db.js) existed with no routes/controllers), built a complete REST API backend:

### Backend File Structure
```
backend/src/
├── app.js                              ← Rewrote: routes + middleware wiring
├── server.js                           ← Unchanged
├── config/
│   ├── db.js                           ← Unchanged
│   └── firebase.js                     ← NEW: Firebase Admin SDK init
├── middleware/
│   ├── auth.js                         ← NEW: verifyToken + optionalAuth
│   └── errorHandler.js                 ← NEW: centralized error handler
├── models/
│   ├── User.js                         ← Rewritten (was userschema.js)
│   ├── Form.js                         ← Rewritten (was formschema.js)
│   ├── FormVersion.js                  ← Rewritten (was formVersionSchema.js)
│   └── Submission.js                   ← Rewritten (was submissionSchema.js)
├── controllers/
│   ├── userController.js               ← NEW
│   ├── formController.js               ← NEW
│   ├── formVersionController.js        ← NEW
│   └── submissionController.js         ← NEW
├── routes/
│   ├── userRoutes.js                   ← NEW
│   ├── formRoutes.js                   ← NEW
│   ├── formVersionRoutes.js            ← NEW
│   └── submissionRoutes.js             ← NEW
└── utils/
    └── validators.js                   ← NEW: AJV schema validation
```

### Key Schema Changes
- **28 component types** from SRS FR-6 (was 9)
- Fixed `componentType` nesting bug (Mongoose `type` keyword clash)
- Fixed `cratedBy` → `createdBy` typo
- Added: `displayName`, `isDeleted`, `scoring`, `pageId`, `group`, `order`, `description`, `closeDate`, `confirmationMessage`, `notifyOnSubmission`, `viewers`, workflow `enabled`

### API Endpoints

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| POST | `/api/users/sync` | ✅ | First-login user sync |
| GET | `/api/users/me` | ✅ | Get profile |
| PATCH | `/api/users/me` | ✅ | Update profile |
| POST | `/api/forms` | ✅ | Create form + v1 |
| GET | `/api/forms` | ✅ | List user's forms |
| GET | `/api/forms/:formId` | ✅ | Get form header |
| PATCH | `/api/forms/:formId` | ✅ | Update title/isActive |
| DELETE | `/api/forms/:formId` | ✅ | Soft-delete |
| GET | `/api/forms/:formId/versions` | ✅ | List versions |
| GET | `/api/forms/:formId/versions/latest` | ✅ | Get latest version |
| GET | `/api/forms/:formId/versions/:v` | ✅ | Get specific version |
| POST | `/api/forms/:formId/versions` | ✅ | Create new version |
| PUT | `/api/forms/:formId/versions/:v` | ✅ | Save/update draft |
| POST | `/api/forms/:formId/versions/publish` | ✅ | Publish |
| POST | `/api/forms/:formId/submissions` | Optional | Submit response |
| GET | `/api/forms/:formId/submissions` | ✅ | List submissions |
| GET | `/api/forms/:formId/submissions/:id` | ✅ | Get submission |

## Verification

All modules load successfully without errors:

```
✓ User.js
✓ Form.js
✓ FormVersion.js
✓ Submission.js
✓ errorHandler.js
✓ validators.js
✓ app.js (full route wiring)
✅ All modules loaded successfully
```

## To Start the Server

You need a `.env` file in `backend/` with:
```
MONGO_URI=mongodb+srv://...
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./path-to-service-account.json
```

Then run: `npm run dev`
