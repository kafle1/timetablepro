# TimetablePro User Guide

Welcome to TimetablePro! This guide will help you understand how to use the system effectively based on your role.

## Table of Contents

- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Common Features](#common-features)
- [Admin Guide](#admin-guide)
- [Teacher Guide](#teacher-guide)
- [Student Guide](#student-guide)
- [Troubleshooting](#troubleshooting)
- [User Workflows](#user-workflows)
- [Feature Interactions](#feature-interactions)
- [Notification System](#notification-system)
- [Mobile Interface Flow](#mobile-interface-flow)
- [Data Synchronization](#data-synchronization)
- [User Interaction Flow](#user-interaction-flow)
- [Permission Flow](#permission-flow)
- [Schedule Creation](#schedule-creation)
- [Navigation Structure](#navigation-structure)

## Getting Started

### Account Creation

1. Visit the TimetablePro website
2. Click "Register" in the top right corner
3. Fill in your details:
   - Full Name
   - Email Address
   - Password (minimum 8 characters)
4. Click "Create Account"

### First Login

1. After registration, log in with your email and password
2. Update your profile:
   - Add a profile picture (optional)
   - Verify your information
   - Set your preferences

## User Roles

### Admin
- Full system access
- Manage users, rooms, and schedules
- View system statistics
- Configure system settings

### Teacher
- View and manage assigned schedules
- Set availability preferences
- View room information
- Update profile

### Student
- View class schedules
- View room information
- Access personal timetable

## Common Features

### Navigation

The main navigation menu includes:
- Schedule
- Rooms
- Profile
- Additional options based on your role

### Profile Management

1. Click your profile picture or name
2. Select "Profile"
3. Update your information:
   - Change profile picture
   - Update name
   - View role and email

### Schedule View

The schedule view shows:
- Time slots (8:00 AM to 6:00 PM)
- Days of the week
- Class information
- Room assignments

## Admin Guide

### Dashboard

Access the admin dashboard to:
- View system statistics
- Monitor active users
- Track room usage
- Access quick actions

### Managing Rooms

1. Navigate to "Rooms"
2. Add new rooms:
   - Click "Add Room"
   - Enter room details:
     - Name
     - Capacity
     - Type
     - Building
3. Edit existing rooms:
   - Click "Edit" on any room card
   - Modify details
   - Save changes
4. Delete rooms:
   - Click "Delete" on the room card
   - Confirm deletion

### Managing Schedules

1. Navigate to "Schedule"
2. Create new schedules:
   - Click "Add Schedule"
   - Select:
     - Subject
     - Teacher
     - Room
     - Time slot
     - Class
3. Edit schedules:
   - Click on any schedule
   - Modify details
   - Save changes
4. Delete schedules:
   - Click "Delete" on the schedule
   - Confirm deletion

### System Configuration

1. Access Settings:
   - Configure email notifications
   - Set system preferences
   - Manage user roles
2. Monitor System Health:
   - View error logs
   - Check performance metrics
   - Monitor database status

## Teacher Guide

### Setting Availability

1. Navigate to "Availability"
2. Set your available time slots:
   - Click on time slots to toggle availability
   - Green indicates available
   - Gray indicates unavailable
3. Save your preferences

### Viewing Schedules

1. Navigate to "Schedule"
2. View your assigned classes:
   - Subject
   - Room
   - Time slot
   - Class
3. Filter view:
   - By day
   - By subject
   - By class

### Managing Classes

1. View class details:
   - Click on any scheduled class
   - See student count
   - Check room information
2. Report conflicts:
   - Click "Report Issue"
   - Describe the problem
   - Submit for admin review

## Student Guide

### Viewing Timetable

1. Navigate to "Schedule"
2. View your class schedule:
   - Subject
   - Teacher
   - Room
   - Time
3. Filter options:
   - By day
   - By subject

### Room Information

1. Navigate to "Rooms"
2. View room details:
   - Location
   - Capacity
   - Facilities
   - Current availability

## Mobile Usage

### Responsive Design

The application is fully responsive:
- Adapts to screen size
- Touch-friendly interface
- Optimized navigation

### Mobile Features

1. Quick Actions:
   - Swipe gestures
   - Touch-friendly buttons
   - Simplified navigation

2. Offline Access:
   - View cached schedules
   - Sync when online
   - Receive notifications

## Troubleshooting

### Common Issues

1. Login Problems:
   - Check email spelling
   - Reset password if forgotten
   - Contact admin if persists

2. Schedule Conflicts:
   - Check for double bookings
   - Verify room availability
   - Contact admin for resolution

3. Display Issues:
   - Clear browser cache
   - Try different browser
   - Check internet connection

### Getting Help

1. In-App Support:
   - Click "Help" icon
   - Browse FAQ section
   - Submit support ticket

2. Contact Support:
   - Email: support@timetablepro.com
   - Response within 24 hours
   - Include screenshots if possible

## Best Practices

### Schedule Management

1. Regular Updates:
   - Check schedule daily
   - Update availability weekly
   - Report conflicts promptly

2. Communication:
   - Use in-app messaging
   - Keep profile updated
   - Respond to notifications

### Data Security

1. Account Security:
   - Use strong passwords
   - Don't share credentials
   - Log out after use

2. Privacy:
   - Review privacy settings
   - Manage visible information
   - Report suspicious activity

## Keyboard Shortcuts

### Navigation
- `Alt + S`: Schedule view
- `Alt + R`: Rooms view
- `Alt + P`: Profile
- `Alt + H`: Help

### Schedule Management
- `Ctrl + N`: New schedule
- `Ctrl + E`: Edit selected
- `Del`: Delete selected
- `Ctrl + F`: Filter view

## Updates and Changes

Stay informed about:
- New features
- System updates
- Maintenance schedules
- Policy changes

Subscribe to notifications for:
- Schedule changes
- Room updates
- System announcements
- Important alerts

## User Workflows

### Admin Workflow

```mermaid
graph TD
    Login[Login] --> Dashboard[Admin Dashboard]
    Dashboard --> Manage_Users[Manage Users]
    Dashboard --> Manage_Rooms[Manage Rooms]
    Dashboard --> Manage_Schedules[Manage Schedules]
    
    Manage_Users --> Add_User[Add User]
    Manage_Users --> Edit_User[Edit User]
    Manage_Users --> Delete_User[Delete User]
    
    Manage_Rooms --> Add_Room[Add Room]
    Manage_Rooms --> Edit_Room[Edit Room]
    Manage_Rooms --> Delete_Room[Delete Room]
    
    Manage_Schedules --> Create_Schedule[Create Schedule]
    Manage_Schedules --> Edit_Schedule[Edit Schedule]
    Manage_Schedules --> Delete_Schedule[Delete Schedule]
    
    style Login fill:#f9f,stroke:#333,stroke-width:2px
    style Dashboard fill:#bbf,stroke:#333,stroke-width:2px
    style Manage_Users,Manage_Rooms,Manage_Schedules fill:#bfb,stroke:#333,stroke-width:2px
```

### Teacher Workflow

```mermaid
graph TD
    Login[Login] --> Dashboard[Teacher Dashboard]
    Dashboard --> View_Schedule[View Schedule]
    Dashboard --> Set_Availability[Set Availability]
    Dashboard --> Profile[Manage Profile]
    
    View_Schedule --> Check_Classes[Check Classes]
    View_Schedule --> Report_Conflict[Report Conflict]
    
    Set_Availability --> Select_Days[Select Days]
    Set_Availability --> Set_Hours[Set Hours]
    
    Profile --> Update_Info[Update Info]
    Profile --> Change_Avatar[Change Avatar]
    
    style Login fill:#f9f,stroke:#333,stroke-width:2px
    style Dashboard fill:#bbf,stroke:#333,stroke-width:2px
    style View_Schedule,Set_Availability,Profile fill:#bfb,stroke:#333,stroke-width:2px
```

### Student Workflow

```mermaid
graph TD
    Login[Login] --> Dashboard[Student Dashboard]
    Dashboard --> View_Schedule[View Schedule]
    Dashboard --> View_Rooms[View Rooms]
    Dashboard --> Profile[Manage Profile]
    
    View_Schedule --> Daily_View[Daily View]
    View_Schedule --> Weekly_View[Weekly View]
    
    View_Rooms --> Room_Info[Room Information]
    View_Rooms --> Room_Availability[Check Availability]
    
    Profile --> Update_Info[Update Info]
    Profile --> Change_Avatar[Change Avatar]
    
    style Login fill:#f9f,stroke:#333,stroke-width:2px
    style Dashboard fill:#bbf,stroke:#333,stroke-width:2px
    style View_Schedule,View_Rooms,Profile fill:#bfb,stroke:#333,stroke-width:2px
```

## Feature Interactions

```mermaid
flowchart TD
    subgraph Schedule Management
        Create[Create Schedule]
        Edit[Edit Schedule]
        Delete[Delete Schedule]
        View[View Schedule]
    end
    
    subgraph Room Management
        CheckRoom[Check Room]
        BookRoom[Book Room]
        ReleaseRoom[Release Room]
    end
    
    subgraph Teacher Management
        CheckAvail[Check Availability]
        SetAvail[Set Availability]
        Notify[Notify Teacher]
    end
    
    Create --> CheckRoom
    Create --> CheckAvail
    CheckRoom --> BookRoom
    CheckAvail --> Notify
    Edit --> ReleaseRoom
    Edit --> BookRoom
    Delete --> ReleaseRoom
    
    style Schedule Management fill:#f9f,stroke:#333,stroke-width:2px
    style Room Management fill:#bbf,stroke:#333,stroke-width:2px
    style Teacher Management fill:#bfb,stroke:#333,stroke-width:2px
```

## Notification System

```mermaid
flowchart TD
    subgraph Events
        Schedule[Schedule Change]
        Room[Room Update]
        System[System Update]
    end
    
    subgraph Processing
        Filter[Filter Rules]
        Template[Message Template]
        Queue[Message Queue]
    end
    
    subgraph Delivery
        Email[Email]
        InApp[In-App]
        Push[Push Notification]
    end
    
    Schedule --> Filter
    Room --> Filter
    System --> Filter
    
    Filter --> Template
    Template --> Queue
    
    Queue --> Email
    Queue --> InApp
    Queue --> Push
    
    style Events fill:#f9f,stroke:#333,stroke-width:2px
    style Processing fill:#bbf,stroke:#333,stroke-width:2px
    style Delivery fill:#bfb,stroke:#333,stroke-width:2px
```

## Mobile Interface Flow

```mermaid
flowchart TD
    subgraph Navigation
        Home[Home Screen]
        Menu[Menu]
        Search[Search]
    end
    
    subgraph Views
        Daily[Daily View]
        Weekly[Weekly View]
        Monthly[Monthly View]
    end
    
    subgraph Actions
        Add[Add Event]
        Edit[Edit Event]
        Share[Share Schedule]
    end
    
    Home --> Menu
    Menu --> Search
    
    Search --> Daily
    Search --> Weekly
    Search --> Monthly
    
    Daily --> Add
    Weekly --> Edit
    Monthly --> Share
    
    style Navigation fill:#f9f,stroke:#333,stroke-width:2px
    style Views fill:#bbf,stroke:#333,stroke-width:2px
    style Actions fill:#bfb,stroke:#333,stroke-width:2px
```

## Data Synchronization

```mermaid
flowchart TD
    subgraph Local Storage
        Cache[Cache]
        Store[Store]
        Queue[Sync Queue]
    end
    
    subgraph Network
        Online[Online]
        Offline[Offline]
        Sync[Sync Process]
    end
    
    subgraph Server
        Validate[Validate]
        Update[Update]
        Respond[Response]
    end
    
    Cache --> Store
    Store --> Queue
    
    Online --> Sync
    Offline --> Queue
    Queue --> Sync
    
    Sync --> Validate
    Validate --> Update
    Update --> Respond
    
    style Local Storage fill:#f9f,stroke:#333,stroke-width:2px
    style Network fill:#bbf,stroke:#333,stroke-width:2px
    style Server fill:#bfb,stroke:#333,stroke-width:2px
```

## User Interaction Flow

```mermaid
graph LR
    A[User] --> B[Login]
    B --> C[Dashboard]
    C --> D[View Schedule]
    C --> E[Manage Profile]
    C --> F[Settings]
    
    D --> G[Daily View]
    D --> H[Weekly View]
    E --> I[Update Info]
    E --> J[Change Avatar]
    F --> K[Preferences]
    F --> L[Notifications]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef action fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef feature fill:#fff0f0,stroke:#333,stroke-width:2px
    
    class A,B default
    class C,D,E,F action
    class G,H,I,J,K,L feature
```

## Permission Flow

```mermaid
graph TB
    A[User Request] --> B{Check Role}
    B -->|Admin| C[Full Access]
    B -->|Teacher| D[Limited Access]
    B -->|Student| E[Basic Access]
    
    C --> F[Manage All]
    D --> G[Manage Own]
    E --> H[View Only]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef decision fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef access fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef action fill:#fff0f0,stroke:#333,stroke-width:2px
    
    class A default
    class B decision
    class C,D,E access
    class F,G,H action
```

## Schedule Creation

```mermaid
graph TB
    A[Start] --> B{Check Permission}
    B -->|Yes| C[Select Time]
    B -->|No| D[Error]
    C --> E{Check Conflicts}
    E -->|No Conflicts| F[Create Schedule]
    E -->|Has Conflicts| G[Show Warning]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef decision fill:#ffe6e6,stroke:#333,stroke-width:2px
    classDef success fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef error fill:#fff0f0,stroke:#333,stroke-width:2px
    
    class A default
    class B,E decision
    class C,F success
    class D,G error
```

## Navigation Structure

```mermaid
graph TB
    A[Home] --> B[Schedule]
    A --> C[Rooms]
    A --> D[Profile]
    
    B --> E[View]
    B --> F[Edit]
    B --> G[Delete]
    
    C --> H[List]
    C --> I[Details]
    C --> J[Book]
    
    D --> K[Info]
    D --> L[Settings]
    D --> M[Logout]

    classDef default fill:#f0f7ff,stroke:#333,stroke-width:2px
    classDef main fill:#e6ffe6,stroke:#333,stroke-width:2px
    classDef action fill:#fff0f0,stroke:#333,stroke-width:2px
    
    class A default
    class B,C,D main
    class E,F,G,H,I,J,K,L,M action
``` 