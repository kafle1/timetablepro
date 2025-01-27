# TimetablePro API Documentation

## Authentication

```typescript
login(email: string, password: string): Promise<AppUser>
register(email: string, password: string, name: string): Promise<AppUser>
logout(): Promise<void>
```

## Schedule Management

```typescript
getSchedules(filters?: {
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: string;
}): Promise<Schedule[]>

createSchedule(schedule: {
    subject: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: string;
}): Promise<Schedule>

updateSchedule(scheduleId: string, schedule: Partial<Schedule>): Promise<Schedule>
deleteSchedule(scheduleId: string): Promise<void>
```

## Room Management

```typescript
getRooms(filters?: {
    building?: string;
    type?: string;
}): Promise<Room[]>

createRoom(room: {
    name: string;
    capacity: number;
    type: string;
    building: string;
}): Promise<Room>

updateRoom(roomId: string, room: Partial<Room>): Promise<Room>
deleteRoom(roomId: string): Promise<void>
```

## Availability Management

```typescript
getTeacherAvailability(teacherId: string): Promise<Availability[]>
setAvailability(availability: {
    teacherId: string;
    dayOfWeek: string;
    availableSlots: TimeSlot[];
}): Promise<Availability>
```

## User Management

```typescript
updateProfile(name: string, avatarFile?: File): Promise<AppUser>
```

## Data Types

```typescript
interface AppUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    avatarUrl?: string;
}

interface Schedule {
    id: string;
    subject: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: string;
}

interface Room {
    id: string;
    name: string;
    capacity: number;
    type: string;
    building: string;
}

interface Availability {
    id: string;
    teacherId: string;
    dayOfWeek: string;
    availableSlots: TimeSlot[];
}

interface TimeSlot {
    start: string; // HH:mm format
    end: string;   // HH:mm format
}
```

## Error Handling

All API functions may throw errors that should be handled appropriately. Common error scenarios include:

- Authentication errors
- Permission errors
- Validation errors
- Network errors
- Resource not found errors

Example error handling:

```typescript
try {
    const schedule = await createSchedule(scheduleData);
} catch (error) {
    if (error instanceof Error) {
        console.error('Error creating schedule:', error.message);
    }
    // Handle error appropriately
}
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as Appwrite Auth
    participant D as Database
    
    C->>F: Login Request
    F->>A: createSession(email, password)
    A-->>F: Session Token
    F->>D: getUser()
    D-->>F: User Data
    F-->>C: User + Session

    Note over C,F: Store session in local storage

    %% Color definitions
    style C fill:#f0f7ff,stroke:#333,stroke-width:2px
    style F fill:#e6ffe6,stroke:#333,stroke-width:2px
    style A fill:#ffe6e6,stroke:#333,stroke-width:2px
    style D fill:#fff0f0,stroke:#333,stroke-width:2px
```

## Schedule Creation Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant D as Database
    
    C->>F: Create Schedule Request
    F->>D: Check Room Availability
    D-->>F: Room Status
    F->>D: Check Teacher Availability
    D-->>F: Teacher Status
    
    alt Conflict Found
        F-->>C: Error: Conflict
    else No Conflict
        F->>D: Create Schedule
        D-->>F: Schedule Created
        F-->>C: Success Response
    end

    %% Color definitions
    style C fill:#f0f7ff,stroke:#333,stroke-width:2px
    style F fill:#e6ffe6,stroke:#333,stroke-width:2px
    style D fill:#fff0f0,stroke:#333,stroke-width:2px
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Schedule : "has"
    User ||--o{ Availability : "sets"
    Room ||--o{ Schedule : "used_in"
    
    %% Entity styling
    classDef user fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef schedule fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef room fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef availability fill:#fff0f0,stroke:#333,stroke-width:2px
    
    class User user
    class Schedule schedule
    class Room room
    class Availability availability
    
    User {
        string id PK
        string name
        string email
        string role
        string avatarUrl
    }
    
    Schedule {
        string id PK
        string subject
        string teacherId FK
        string roomId FK
        string dayOfWeek
        string startTime
        string endTime
        string class
    }
    
    Room {
        string id PK
        string name
        int capacity
        string type
        string building
    }
    
    Availability {
        string id PK
        string teacherId FK
        string dayOfWeek
        string[] availableSlots
    }
```

## Data Flow

```mermaid
flowchart TD
    subgraph Client["Client Layer"]
        UI[User Interface]
        Store[State Store]
        Cache[Local Cache]
    end
    
    subgraph API["API Layer"]
        Auth[Authentication]
        Validation[Data Validation]
        ErrorHandler[Error Handler]
    end
    
    subgraph Backend["Backend Layer"]
        AppwriteAuth[Appwrite Auth]
        AppwriteDB[Appwrite Database]
        AppwriteStorage[Appwrite Storage]
    end
    
    UI --> Store
    Store --> Cache
    UI --> Auth
    Auth --> Validation
    Validation --> ErrorHandler
    Auth --> AppwriteAuth
    Validation --> AppwriteDB
    ErrorHandler --> UI
    
    classDef client fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef api fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef backend fill:#ffe6e6,stroke:#333,stroke-width:2px
    
    class UI,Store,Cache client
    class Auth,Validation,ErrorHandler api
    class AppwriteAuth,AppwriteDB,AppwriteStorage backend
    
    style Client fill:#f0f7ff,stroke:#333,stroke-width:2px
    style API fill:#e6ffe6,stroke:#333,stroke-width:2px
    style Backend fill:#ffe6e6,stroke:#333,stroke-width:2px
```

## Error Handling Flow

```mermaid
stateDiagram-v2
    [*] --> Request
    Request --> Validation
    
    state Validation {
        [*] --> CheckInput
        CheckInput --> ValidInput: Valid
        CheckInput --> InvalidInput: Invalid
        InvalidInput --> ReturnError
        ValidInput --> ProcessRequest
    }
    
    Validation --> ProcessRequest: Valid
    Validation --> ReturnError: Invalid
    
    ProcessRequest --> Success
    ProcessRequest --> APIError
    
    APIError --> RetryLogic
    RetryLogic --> ProcessRequest: Retry
    RetryLogic --> ReturnError: Max Retries
    
    Success --> [*]
    ReturnError --> [*]
```

## API Rate Limiting

```mermaid
flowchart TD
    subgraph Rate Limiter
        Request[API Request]
        Check[Check Rate Limit]
        Allow[Allow Request]
        Block[Block Request]
        
        Request --> Check
        Check --> Allow: Under Limit
        Check --> Block: Over Limit
        Allow --> UpdateCount[Update Counter]
        Block --> ReturnError[Return 429 Error]
    end
    
    style Rate Limiter fill:#f9f,stroke:#333,stroke-width:2px
```

## API Request Flow

```mermaid
graph LR
    A[Client] --> B[API Gateway]
    B --> C{Auth Check}
    C -->|Valid| D[Process Request]
    C -->|Invalid| E[Return Error]
    D --> F[Return Response]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef gateway fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef check fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef error fill:#fff0f0,stroke:#333,stroke-width:2px
    classDef success fill:#e6ffe6,stroke:#333,stroke-width:2px

    class A default
    class B gateway
    class C check
    class D,F success
    class E error
```

## Authentication Process

```mermaid
graph TB
    A[Start] --> B[Get Credentials]
    B --> C{Validate}
    C -->|Valid| D[Create Session]
    C -->|Invalid| E[Auth Error]
    D --> F[Return Token]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef process fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef validate fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef error fill:#fff0f0,stroke:#333,stroke-width:2px
    classDef success fill:#e6ffe6,stroke:#333,stroke-width:2px

    class A default
    class B process
    class C validate
    class D,F success
    class E error
```

## Data Access Flow

```mermaid
graph TB
    A[Request] --> B{Cache Check}
    B -->|Hit| C[Return Cached]
    B -->|Miss| D[Query DB]
    D --> E[Update Cache]
    E --> F[Return Data]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef check fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef cache fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef db fill:#fff0f0,stroke:#333,stroke-width:2px

    class A default
    class B check
    class C,E cache
    class D db
    class F default
```

## Error Handling

```mermaid
graph TB
    A[Error] --> B{Type Check}
    B -->|Auth| C[401 Response]
    B -->|Permission| D[403 Response]
    B -->|Validation| E[400 Response]
    B -->|Server| F[500 Response]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef check fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef client fill:#fff0f0,stroke:#333,stroke-width:2px
    classDef server fill:#ffe6e6,stroke:#333,stroke-width:2px

    class A default
    class B check
    class C,D,E client
    class F server
``` 