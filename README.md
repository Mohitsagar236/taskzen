# TO-do

## API Routes

### `/api/teams`

A Next.js API route that returns teams for the currently authenticated user.

#### Request

```
GET /api/teams
```

#### Authentication

Requires an authenticated Supabase session.

#### Response

```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Team Name",
      "description": "Team description",
      "created_at": "2025-05-18T15:00:00.000Z",
      "owner_id": "user-uuid",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  ]
}
```

#### Error Response

```json
{
  "error": "Error message"
}
```

#### Status Codes

- `200 OK`: Teams were successfully retrieved
- `401 Unauthorized`: User is not authenticated
- `500 Internal Server Error`: Server error occurred