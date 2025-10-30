# REST API Plan

## 1. Resources

- **Users** – `users` table
- **Clothes** – `cloth` table
- **Photos** – `cloth_photos` table
- **Categories** – `categories` table
- **Tags** – `tags` table
- **Outfits** – `outfits` table
- **Outfit Items** – `outfit_items` table
- **AI Suggestions Log** – `ai_suggestions_log` table
- **History Changes (Audit Log)** – `history_changes` table

---

## 2. Endpoints

### 2.1 User Profile & Auth

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | `/api/auth/guest`             | Create/start guest session           |
| POST   | `/api/auth/magic-link`        | Request magic link login             |
| POST   | `/api/auth/magic-link/verify` | Finalize login from email            |
| GET    | `/api/user/profile`           | Get current user profile             |
| DELETE | `/api/user/data`              | Permanently delete user data/account |

#### Example: Magic Link Request

- **Request:**

```json
{ "email": "user@site.com" }
```

- **Response (200):**

```json
{ "message": "Magic link sent" }
```

- **Errors:**  
  422 – Invalid email, 429 – Rate limit, 500 – Server error

---

### 2.2 Clothes

| Method | Path               | Description                            |
| ------ | ------------------ | -------------------------------------- |
| GET    | `/api/clothes`     | List clothes (supports filters/paging) |
| POST   | `/api/clothes`     | Add new clothing item                  |
| GET    | `/api/clothes/:id` | Get clothing details                   |
| PATCH  | `/api/clothes/:id` | Edit clothing attributes               |
| DELETE | `/api/clothes/:id` | Soft-delete clothing                   |

#### Filtering, Pagination, Sorting

- `GET /api/clothes?category=ID&tag=ID&season=...&location=...&q=search&page=1&limit=20&sort=-created_at`
- **Query params:** category, tag, color, season, location, full-text search, sort, paging

#### Payload: Create New Clothing Item

```json
{
  "name": "Blue Jeans",
  "description": "Levi's 501",
  "category_id": 3,
  "color": "blue",
  "brand": "Levi's",
  "season": "spring",
  "location": "wardrobe",
  "tags": [1, 2, 3]
}
```

- **Response (201):**

```json
{
  "id": 101,
  "name": "...",
  "...": "...",
  "photos": [],
  "...": "..."
}
```

- **Errors:**  
  400 – Missing fields, 403 – Not owned, 409 – Unique violation

---

### 2.3 Photos

| Method | Path                                    | Description                                    |
| ------ | --------------------------------------- | ---------------------------------------------- |
| POST   | `/api/clothes/:clothId/photos`          | Add photo to clothing item (multipart upload)  |
| GET    | `/api/clothes/:clothId/photos`          | Get all photos for a clothing item             |
| PATCH  | `/api/clothes/:clothId/photos/:photoId` | Set/unset main photo, soft-delete, update meta |
| DELETE | `/api/clothes/:clothId/photos/:photoId` | Remove photo (soft-delete)                     |

---

### 2.11 Create Clothing from Photo (photo-first flow)

| Method | Path                      | Description                                  |
| ------ | ------------------------- | -------------------------------------------- |
| POST   | `/api/clothes/from-photo` | Create clothing with main photo and metadata |

- Multipart request: `photo` (file, required), all other metadata optional
- Optionally trigger AI suggestions and return them in response

#### Payload (multipart/form-data)

- `photo` (file, required)
- Optional: `name`, `description`, `category_id`, `color`, `brand`, `season`, `location`, `tags`
- Optional: `ai_suggestions` (bool, default true) – whether API should suggest metadata from photo

#### Example response

```json
{
  "id": 101,
  "name": "",
  "photos": [{ "id": 999, "main": true, "file_path": "..." }],
  "ai_suggestions": {
    "name": "T-shirt Adidas",
    "category": "koszulka",
    "season": "summer"
  }
}
```

---

### 2.4 Categories

| Method | Path                  | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/api/categories`     | List user categories |
| POST   | `/api/categories`     | Add new category     |
| PATCH  | `/api/categories/:id` | Edit category        |
| DELETE | `/api/categories/:id` | Delete category      |

#### Payloads/Responses

- Payloads: `{ "name": "Casual" }`
- Responses: category object(s)
- Errors: 409 – Non-unique, 403 – Not owned

---

### 2.5 Tags

| Method | Path            | Description    |
| ------ | --------------- | -------------- |
| GET    | `/api/tags`     | List user tags |
| POST   | `/api/tags`     | Create tag     |
| PATCH  | `/api/tags/:id` | Update tag     |
| DELETE | `/api/tags/:id` | Delete tag     |

#### Tag Management for Clothing

| Method | Path                    | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| PATCH  | `/api/clothes/:id/tags` | Update tags for clothing (replace array) |

- **Payload:** `{ "tags": [1,5,7] }`
- **Response:** Clothing item with updated tags

---

### 2.6 Outfits

| Method | Path               | Description       |
| ------ | ------------------ | ----------------- |
| GET    | `/api/outfits`     | List outfits      |
| POST   | `/api/outfits`     | Create outfit     |
| GET    | `/api/outfits/:id` | Get outfit detail |
| PATCH  | `/api/outfits/:id` | Edit outfit       |
| DELETE | `/api/outfits/:id` | Delete outfit     |

#### Outfits Items (Add/Remove Clothing in Outfit)

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/api/outfits/:id/items`          | Add cloth to outfit (body: cloth_id) |
| DELETE | `/api/outfits/:id/items/:clothId` | Remove cloth from outfit             |

---

### 2.7 AI Categorization & Suggestion

| Method | Path                  | Description                       |
| ------ | --------------------- | --------------------------------- |
| POST   | `/api/ai-suggestions` | Log AI suggestion, fetch proposal |
| GET    | `/api/ai-suggestions` | List AI suggestions for user/item |

#### Payload

```json
{
  "cloth_id": 10,
  "input": "...",
  "suggested_category": "Jeans",
  "suggested_tags": ["casual", "summer"],
  "confidence": 0.91,
  "user_decision": "accept"
}
```

---

### 2.9 History & Audit Log

| Method | Path                   | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/history-changes` | List/audit history/log |

#### Filter by entity, date, operation

---

### 2.10 Bulk Actions & Smart Lists

| Method | Path                      | Description                   |
| ------ | ------------------------- | ----------------------------- |
| PATCH  | `/api/clothes/bulk`       | Mass update (e.g. set season) |
| GET    | `/api/clothes/smart-list` | Predefined smart lists        |

#### Payload: Bulk Edit

```json
{
  "item_ids": [1, 2, 3],
  "attribute": "location",
  "value": "basement"
}
```

---

## 3. Authentication and Authorization

- **Guest sessions:** token issued on guest create; included in all requests
- **Magic link login:** token issued on link verification
- **All resources are always accessed "as user" — no multi-user access**
- **Authorization enforced on all endpoints using user token**
- **All data queries are filtered by `user_id` (pseudo-RLS)**
- **Sensitive operations (delete, export) require reauthentication**
- **Local and transit encryption** (if remote sync/service is involved)

---

## 4. Validation and Business Logic

### General Validation:

- All creations/updates must include required fields, correct types
- `name` fields (categories/tags) must be unique per user (409 on violation)
- Timestamps are integers (UNIX, ms/sec)
- Ownership: only resources owned by the user can be managed
- Soft-delete respected in all GET/list by default (unless admin/debug override)
- Photos: main = 1 per cloth (409 on conflict)
- Max photo upload size = 3MB (reject above)
- Bulk edits: enforce all item_ids belong to user (reject if not)
- Audit logs: record every create/update/delete

### Resource-specific validation:

**Clothes:**

- On creation: at least `name`, `category_id`, and (after init) at least one photo
- Attributes: restrict to allowed set (`color`, `brand`, `season`, `location`)
- Soft-delete by setting `deleted_at`; hard delete only on user data delete

**Categories/Tags:**

- Unique per user and non-empty name

**Photos:**

- Only one main photo per `cloth_id`

**AI Suggestions:**

- Decision log must record user action if not auto-accepted

**Outfits:**

- All items must exist & belong to user before being associated

**User:**

- Delete endpoint must hard-delete all user data (cascade)
