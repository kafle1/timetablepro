# API Reference

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name",
  "role": "teacher"
}
```

## Schedules

### Get Schedule
```http
GET /schedules/{id}
Authorization: Bearer {token}
```

### Create Schedule
```http
POST /schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Spring 2024",
  "startDate": "2024-01-01",
  "endDate": "2024-05-31"
}
```

### Update Schedule
```http
PUT /schedules/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

## Rooms

### List Rooms
```http
GET /rooms
Authorization: Bearer {token}
```

### Book Room
```http
POST /rooms/{id}/book
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-03-15",
  "startTime": "09:00",
  "endTime": "10:30"
}
```

## Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

Common error codes:
- `AUTH_INVALID`: Invalid credentials
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Insufficient permissions 