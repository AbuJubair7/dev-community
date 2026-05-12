# Dev Community

---

## Database Schemas

### User

```
User {
  _id:       ObjectId
  name:      String  (required)
  email:     String  (required, unique)
  password:  String  (required, hashed)
  avatar:    String  (optional, URL)
  createdAt: Date
  updatedAt: Date
}
```

### Skill

```
Skill {
  _id:       ObjectId
  userId:    ObjectId  (ref: User, required)
  name:      String    (required)
  createdAt: Date
  updatedAt: Date
}
```

### Experience

```
Experience {
  _id:         ObjectId
  userId:      ObjectId  (ref: User, required)
  title:       String    (required)
  company:     String    (required)
  startDate:   Date      (required)
  endDate:     Date      (optional, null if current)
  isCurrent:   Boolean   (default: false)
  createdAt:   Date
  updatedAt:   Date
}
```

### Post

```
Post {
  _id:       ObjectId
  authorId:  ObjectId  (ref: User, required)
  title:     String    (required)
  content:   String    (required)
  createdAt: Date
  updatedAt: Date
}
```

### Comment

```
Comment {
  _id:       ObjectId
  postId:    ObjectId  (ref: Post, required)
  authorId:  ObjectId  (ref: User, required)
  content:   String    (required)
  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints

### Auth

| Method | Endpoint         | Description              | Auth Required |
| ------ | ---------------- | ------------------------ | ------------- |
| POST   | `/auth/register` | Register a new developer | No            |
| POST   | `/auth/login`    | Login, returns JWT       | No            |

### User

| Method | Endpoint     | Description                       | Auth Required |
| ------ | ------------ | --------------------------------- | ------------- |
| GET    | `/users/:id` | Get a developer's profile         | No            |
| PATCH  | `/users/:id` | Update own profile (name, avatar) | Yes           |

### Skills

| Method | Endpoint            | Description                   | Auth Required |
| ------ | ------------------- | ----------------------------- | ------------- |
| GET    | `/users/:id/skills` | Get all skills of a developer | No            |
| POST   | `/skills`           | Add a skill                   | Yes           |
| PATCH  | `/skills/:id`       | Update a skill                | Yes           |
| DELETE | `/skills/:id`       | Delete a skill                | Yes           |

### Experiences

| Method | Endpoint                 | Description                        | Auth Required |
| ------ | ------------------------ | ---------------------------------- | ------------- |
| GET    | `/users/:id/experiences` | Get all experiences of a developer | No            |
| POST   | `/experiences`           | Add an experience                  | Yes           |
| PATCH  | `/experiences/:id`       | Update an experience               | Yes           |
| DELETE | `/experiences/:id`       | Delete an experience               | Yes           |

### Posts

| Method | Endpoint     | Description          | Auth Required |
| ------ | ------------ | -------------------- | ------------- |
| GET    | `/posts`     | Get all posts (feed) | No            |
| GET    | `/posts/:id` | Get a single post    | No            |
| POST   | `/posts`     | Create a post        | Yes           |
| PATCH  | `/posts/:id` | Update own post      | Yes           |
| DELETE | `/posts/:id` | Delete own post      | Yes           |

### Comments

| Method | Endpoint                  | Description                | Auth Required |
| ------ | ------------------------- | -------------------------- | ------------- |
| GET    | `/posts/:postId/comments` | Get all comments on a post | No            |
| POST   | `/posts/:postId/comments` | Add a comment to a post    | Yes           |
| PATCH  | `/comments/:id`           | Update own comment         | Yes           |
| DELETE | `/comments/:id`           | Delete own comment         | Yes           |

---
