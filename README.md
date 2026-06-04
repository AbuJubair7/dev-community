# Dev Community - Backend API

A production-ready NestJS application powering a developer community platform. Features include user profiles, skills & experience tracking, communities with member roles & join requests, posting feed with reacts (likes/dislikes), parent-nested comments, and scheduled post publishing powered by BullMQ & Redis.

---

## 🚀 Project Setup Guide

### 📋 Prerequisites

Before setting up and running the application, make sure you have the following installed on your system:
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or later)
- **MongoDB** (running locally or an Atlas connection URI)
- **Redis** (v6.x or later, required for BullMQ queues and post scheduling)

---

### ⚙️ Installation & Configuration

1. **Clone the Repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd dev-community
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory. You can copy the example configuration:
   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and configure the variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/dev-community   # MongoDB Connection String
   PORT=3000                                           # Application Server Port
   HOST=0.0.0.0                                        # Server Bind Host
   JWT_SECRET=super_secret_key_here                    # Secret for signing JWT tokens
   JWT_EXPIRES_IN=1h                                   # Token expiration time (e.g. 1h, 7d)
   
   # Optional: Email setup for notifications
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   
   # Required: Redis URL for post scheduling queue
   REDIS_URL=redis://127.0.0.1:6379
   ```

---

### 🏃 Running the Application

Ensure your MongoDB and Redis instances are running, then run one of the following commands:

```bash
# Development mode (Hot reload)
npm run start:dev

# Standard run
npm run start

# Production build & run
npm run build
npm run start:prod
```

---

### 🧪 Running Tests

```bash
# Unit tests
npm run test

# End-to-End (e2e) tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🗄️ Database Schemas (Mongoose / MongoDB)

All schemas are defined using NestJS Mongoose decorators with automatic `timestamps` enabled (except Experience).

### 1. User
Represents a developer registered on the platform.
* **Collection name:** `users`
* **Schema structure:**
  ```typescript
  User {
    _id:       ObjectId (Primary Key)
    fname:     String   (Required)
    lname:     String   (Required)
    email:     String   (Required, Unique)
    password:  String   (Required)
    createdAt: Date     (Auto-generated)
    updatedAt: Date     (Auto-generated)
  }
  ```

### 2. Skill
Individual developer skills tied to a user.
* **Collection name:** `skills`
* **Schema structure:**
  ```typescript
  Skill {
    _id:       ObjectId (Primary Key)
    userId:    ObjectId (Ref: User, Required)
    name:      String   (Required)
    createdAt: Date     (Auto-generated)
    updatedAt: Date     (Auto-generated)
  }
  ```

### 3. Experience
Professional experience items on a developer's profile.
* **Collection name:** `experiences`
* **Schema structure:**
  ```typescript
  Experience {
    _id:          ObjectId (Primary Key)
    userId:       ObjectId (Ref: User, Required)
    companyName:  String   (Required)
    role:         String   (Required)
    startDate:    Date     (Required)
    endDate:      Date     (Optional)
    description:  String   (Optional)
  }
  ```

### 4. Post
A community publication, which can be published immediately or scheduled.
* **Collection name:** `posts`
* **Schema structure:**
  ```typescript
  Post {
    _id:         ObjectId (Primary Key)
    userId:      ObjectId (Ref: User, Required)
    communityId: ObjectId (Ref: Community, Required)
    title:       String   (Required)
    content:     String   (Required)
    postAt:      Date     (Optional, used for scheduling)
    status:      String   (Enum: 'published' | 'scheduled', Default: 'published')
    createdAt:   Date     (Auto-generated)
    updatedAt:   Date     (Auto-generated)
  }
  ```

### 5. Comment
Threaded comment support on posts.
* **Collection name:** `comments`
* **Schema structure:**
  ```typescript
  Comment {
    _id:       ObjectId  (Primary Key)
    postId:    ObjectId  (Ref: Post, Required)
    userId:    ObjectId  (Ref: User, Required)
    content:   String    (Required)
    parentId:  ObjectId  (Ref: Comment, Default: null)
    isDeleted: Boolean   (Default: false)
    createdAt: Date      (Auto-generated)
    updatedAt: Date      (Auto-generated)
  }
  ```

### 6. Community
A workspace or group where developers share posts.
* **Collection name:** `communities`
* **Schema structure:**
  ```typescript
  Community {
    _id:         ObjectId (Primary Key)
    name:        String   (Required)
    description: String   (Optional)
    createdAt:   Date     (Auto-generated)
    updatedAt:   Date     (Auto-generated)
  }
  ```

### 7. CommunityMember
Tracks user memberships and roles inside communities.
* **Collection name:** `communitymembers`
* **Schema structure:**
  ```typescript
  CommunityMember {
    _id:         ObjectId (Primary Key)
    communityId: ObjectId (Ref: Community, Required)
    userId:      ObjectId (Ref: User, Required)
    role:        String   (Enum: 'admin' | 'moderator' | 'member', Default: 'member')
    createdAt:   Date     (Auto-generated)
    updatedAt:   Date     (Auto-generated)
  }
  ```

### 8. CommunityInvite
Invitations sent by community admins/moderators to users.
* **Collection name:** `communityinvites`
* **Schema structure:**
  ```typescript
  CommunityInvite {
    _id:         ObjectId (Primary Key)
    communityId: ObjectId (Ref: Community, Required)
    inviterId:   ObjectId (Ref: User, Required)
    inviteeId:   ObjectId (Ref: User, Required)
    status:      String   (Enum: 'pending' | 'accepted' | 'declined', Default: 'pending')
    createdAt:   Date     (Auto-generated)
    updatedAt:   Date     (Auto-generated)
  }
  ```

### 9. CommunityRequest
Requests submitted by users to join restricted communities.
* **Collection name:** `communityrequests`
* **Schema structure:**
  ```typescript
  CommunityRequest {
    _id:         ObjectId (Primary Key)
    communityId: ObjectId (Ref: Community, Required)
    userId:      ObjectId (Ref: User, Required)
    status:      String   (Enum: 'pending' | 'accepted' | 'declined', Default: 'pending')
    createdAt:   Date     (Auto-generated)
    updatedAt:   Date     (Auto-generated)
  }
  ```

### 10. PostReact
User likes or dislikes on posts.
* **Collection name:** `postreacts`
* **Schema structure:**
  ```typescript
  PostReact {
    _id:       ObjectId (Primary Key)
    userId:    ObjectId (Ref: User, Required)
    postId:    ObjectId (Ref: Post, Required)
    state:     String   (Enum: 'LIKE' | 'DISLIKE' | 'NEUTRAL', Default: 'NEUTRAL')
    createdAt: Date     (Auto-generated)
    updatedAt: Date     (Auto-generated)
  }
  ```

### 11. CommentReact
User likes or dislikes on comments.
* **Collection name:** `commentreacts`
* **Schema structure:**
  ```typescript
  CommentReact {
    _id:       ObjectId (Primary Key)
    userId:    ObjectId (Ref: User, Required)
    commentId: ObjectId (Ref: Comment, Required)
    state:     String   (Enum: 'LIKE' | 'DISLIKE' | 'NEUTRAL', Default: 'NEUTRAL')
    createdAt: Date     (Auto-generated)
    updatedAt: Date     (Auto-generated)
  }
  ```

---

## 🛣️ API Endpoints Reference

> 🔑 **Authorization:** Routes marked with **Yes** in the Auth column require a valid JWT token sent in the `Authorization` header as `Bearer <JWT_TOKEN>`. Tokens are obtained via the registration or login endpoints.

---

### 1. Authentication
Endpoints for signing up and logging in.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/auth/register` | No | None | `{ fname, lname, email, password }` | Register a new user account. |
| **POST** | `/auth/login` | No | None | `{ email, password }` | Authenticate and get a JWT token. |

---

### 2. Users Profile
Endpoints for managing registered user profiles and passwords.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **GET** | `/users` | Yes | None | None | Retrieve a list of all users. |
| **GET** | `/users/:id` | Yes | `:id` (User ObjectId) | None | Get a user profile by ID. |
| **PATCH** | `/users` | Yes | None | `{ fname?, lname?, password? }` | Update current user's profile details. |
| **PATCH** | `/users/password` | Yes | None | `{ oldPassword, newPassword, confirmPassword }` | Change the logged-in user's password. |
| **DELETE** | `/users` | Yes | None | None | Permanently delete own user account. |

---

### 3. Skills
Manage developer skills.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/skills` | Yes | None | `{ name }` | Add a new skill for the logged-in user. |
| **GET** | `/skills` | Yes | None | None | Get all skills of the current user. |
| **GET** | `/skills/:id` | Yes | `:id` (Skill ObjectId) | None | Get details of a specific skill. |
| **GET** | `/skills/user/:userId` | Yes | `:userId` (User ObjectId) | None | Get all skills added by a specific user. |
| **PATCH** | `/skills/:id` | Yes | `:id` (Skill ObjectId) | `{ name? }` | Update a skill name (must be owner). |
| **DELETE** | `/skills/:id` | Yes | `:id` (Skill ObjectId) | None | Delete a skill (must be owner). |

---

### 4. Professional Experiences
Manage experience timelines.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/experiences` | Yes | None | `{ companyName, role, startDate, endDate?, description? }` | Add experience for current user. |
| **GET** | `/experiences` | Yes | None | None | Get all experiences of current user. |
| **GET** | `/experiences/:id` | Yes | `:id` (Experience ObjectId) | None | Get a specific experience by ID. |
| **GET** | `/experiences/user/:userId` | Yes | `:userId` (User ObjectId) | None | Get all experiences of a specific user. |
| **PATCH** | `/experiences/:id` | Yes | `:id` (Experience ObjectId) | `{ companyName?, role?, startDate?, endDate?, description? }` | Update experience details (must be owner). |
| **DELETE** | `/experiences/:id` | Yes | `:id` (Experience ObjectId) | None | Remove an experience entry (must be owner). |

---

### 5. Posts Feed & Scheduling
Manage post sharing, including BullMQ-based post scheduling.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/posts` | Yes | None | `{ communityId, title, content, postAt? }` | Create a post. If `postAt` is a future ISO string, it is queued for scheduled release. |
| **GET** | `/posts` | Yes | None | None | Get all published posts in the community feed. |
| **GET** | `/posts/:id` | Yes | `:id` (Post ObjectId) | None | Get details of a single post by ID. |
| **GET** | `/posts/user/:userId` | Yes | `:userId` (User ObjectId) | None | Retrieve all posts authored by a specific user. |
| **PATCH** | `/posts/:id` | Yes | `:id` (Post ObjectId) | `{ title?, content?, postAt?, communityId? }` | Update post details (must be owner). |
| **DELETE** | `/posts/:id` | Yes | `:id` (Post ObjectId) | None | Delete a post (must be owner). |

---

### 6. Threaded Comments
Manage nested, tree-structured comments on posts.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/comments` | Yes | None | `{ postId, content, parentId? }` | Create a comment. Provide `parentId` for replies. |
| **GET** | `/comments/post/:postId` | Yes | `:postId` (Post ObjectId)<br>Query: `page?`, `limit?`, `replyLimit?` | None | Get a paginated list of top-level comments on a post. |
| **GET** | `/comments/:id/replies` | Yes | `:id` (Comment ObjectId)<br>Query: `page?`, `limit?` | None | Get nested reply comments for a specific comment. |
| **GET** | `/comments/:id` | Yes | `:id` (Comment ObjectId) | None | Get a single comment by ID. |
| **PATCH** | `/comments/:id` | Yes | `:id` (Comment ObjectId) | `{ content }` | Edit a comment content (must be owner). |
| **DELETE** | `/comments/:id` | Yes | `:id` (Comment ObjectId) | None | Soft-delete a comment (must be owner). |

---

### 7. Likes & Dislikes (Reacts)
Submit and retrieve post/comment reactions.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/reacts/post` | Yes | None | `{ userId, postId, state }` | Create reaction on a post (`state`: `LIKE`, `DISLIKE`, `NEUTRAL`). |
| **GET** | `/reacts/post` | Yes | Query: `postId` (Required) | None | Retrieve all reactions for a specific post. |
| **GET** | `/reacts/post/:id` | Yes | `:id` (PostReact ObjectId) | None | Get details of a single post reaction by ID. |
| **PATCH** | `/reacts/post` | Yes | Query: `postId`, `userId` (Required) | `{ state }` | Update post reaction state. |
| **DELETE** | `/reacts/post/:id` | Yes | `:id` (PostReact ObjectId)<br>Query: `userId` (Required) | None | Remove a post reaction by ID. |
| **POST** | `/reacts/comment` | Yes | None | `{ userId, commentId, state }` | Create reaction on a comment (`state`: `LIKE`, `DISLIKE`, `NEUTRAL`). |
| **GET** | `/reacts/comment` | Yes | Query: `commentId` (Required) | None | Retrieve all reactions for a specific comment. |
| **GET** | `/reacts/comment/:id` | Yes | `:id` (CommentReact ObjectId) | None | Get details of a single comment reaction by ID. |
| **PATCH** | `/reacts/comment` | Yes | Query: `commentId`, `userId` (Required) | `{ state }` | Update comment reaction state. |
| **DELETE** | `/reacts/comment/:id` | Yes | `:id` (CommentReact ObjectId)<br>Query: `userId` (Required) | None | Remove a comment reaction by ID. |

---

### 8. Communities & Role management
Manage community details, invitations, memberships, requests, and roles.

| Method | Route | Auth | URL / Query Params | Request Body (DTO) | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **POST** | `/community` | Yes | None | `{ name, description }` | Create a new community. The creator is added as the `admin` member. |
| **GET** | `/community` | Yes | None | None | Get list of all communities. |
| **GET** | `/community/member/my` | Yes | None | None | Get communities the current user is a member of. |
| **GET** | `/community/invites/my` | Yes | None | None | Get pending invites sent to the current user. |
| **GET** | `/community/requests/managed` | Yes | None | None | Get join requests for communities where user is `admin`/`moderator`. |
| **GET** | `/community/:id` | Yes | `:id` (Community ObjectId) | None | Get community details. |
| **PATCH** | `/community/:id` | Yes | `:id` (Community ObjectId) | `{ name?, description? }` | Update community details (Requires role: `admin`, `moderator`). |
| **DELETE** | `/community/:id` | Yes | `:id` (Community ObjectId) | None | Delete community (Requires role: `admin`). |
| **POST** | `/community/:id/invite` | Yes | `:id` (Community ObjectId) | `{ inviteeId }` | Send a join invitation to a user (Requires role: `admin`, `moderator`). |
| **POST** | `/community/:id/request` | Yes | `:id` (Community ObjectId) | None | Request to join a community. |
| **POST** | `/community/invite/:inviteId/accept` | Yes | `:inviteId` (Invite ObjectId) | None | Accept a community invitation. |
| **POST** | `/community/invite/:inviteId/decline` | Yes | `:inviteId` (Invite ObjectId) | None | Decline a community invitation. |
| **POST** | `/community/:id/request/:requestId/accept` | Yes | `:id` (Community ObjectId),<br>`:requestId` (Request ObjectId) | None | Accept a member request to join (Requires role: `admin`, `moderator`). |
| **POST** | `/community/:id/request/:requestId/decline` | Yes | `:id` (Community ObjectId),<br>`:requestId` (Request ObjectId) | None | Decline a member request to join (Requires role: `admin`, `moderator`). |
| **PATCH** | `/community/:id/member/:userId/role` | Yes | `:id` (Community ObjectId),<br>`:userId` (User ObjectId) | `{ role }` | Change a member's role (`admin`, `moderator`, `member`) (Requires role: `admin`). |
| **DELETE** | `/community/:id/member/:userId` | Yes | `:id` (Community ObjectId),<br>`:userId` (User ObjectId) | None | Remove a member from the community (Requires role: `admin`, `moderator`). |
| **GET** | `/community/:id/members` | Yes | `:id` (Community ObjectId) | None | List all members in the community. |
| **GET** | `/community/:id/requests` | Yes | `:id` (Community ObjectId) | None | List pending requests to join (Requires role: `admin`, `moderator`). |
| **GET** | `/community/:id/my-role` | Yes | `:id` (Community ObjectId) | None | Get current user's role in the community. |