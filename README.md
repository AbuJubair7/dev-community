# Dev Community

---

## Database Schemas

### User

```
User {
  _id:       String  (primary)
  fname:     String  (required)
  lname:     String  (required)
  email:     String  (required, unique)
  password:  String  (required)
  createdAt: Date
  updatedAt: Date
}
```

### Skill

```
Skill {
  _id:       String  (primary)
  userId:    String  (ref: User, required)
  name:      String  (required)
  createdAt: Date
  updatedAt: Date
}
```

### Experience

```
Experience {
  _id:          String  (primary)
  userId:       String  (ref: User, required)
  companyName:  String  (required)
  role:         String  (required)
  startDate:    Date    (required)
  endDate:      Date    (optional)
  description:  String  (optional)
}
```

### Post

```
Post {
  _id:       String  (primary)
  userId:    String
  title:     String  (required)
  content:   String  (required)
  createdAt: Date
  updatedAt: Date
}
```

---

## API Endpoints

> All routes marked **Yes** under Auth require a `Bearer <JWT>` token in the `Authorization` header.
> JWT is issued on `/auth/register` and `/auth/login` and expires in **1 hour**.

---

### Auth

| Method | Endpoint         | Description                          | Auth Required |
| ------ | ---------------- | ------------------------------------ | ------------- |
| POST   | `/auth/register` | Register a new developer             | No            |
| POST   | `/auth/login`    | Login — returns `{ token, user }`    | No            |

---

### Users

| Method | Endpoint            | Description                        | Auth Required |
| ------ | ------------------- | ---------------------------------- | ------------- |
| GET    | `/users`            | Get all users                      | Yes           |
| GET    | `/users/:id`        | Get a user by their ID             | Yes           |
| PATCH  | `/users`            | Update own profile (fname, lname)  | Yes           |
| PATCH  | `/users/password`   | Update own password                | Yes           |
| DELETE | `/users`            | Delete own account                 | Yes           |

---

### Skills

| Method | Endpoint                  | Description                                          | Auth Required |
| ------ | ------------------------- | ---------------------------------------------------- | ------------- |
| POST   | `/skills`                 | Add a skill for the logged-in user                   | Yes           |
| GET    | `/skills`                 | Get all skills of the logged-in user                 | Yes           |
| GET    | `/skills/:id`             | Get a specific skill by its ID                       | Yes           |
| GET    | `/skills/user/:userId`    | Get all skills for any user by their user ID         | Yes           |
| PATCH  | `/skills/:id`             | Update a skill by its ID (must be owner)             | Yes           |
| DELETE | `/skills/:id`             | Delete a skill by its ID (must be owner)             | Yes           |

---

### Experiences

| Method | Endpoint                       | Description                                               | Auth Required |
| ------ | ------------------------------ | --------------------------------------------------------- | ------------- |
| POST   | `/experiences`                 | Add an experience for the logged-in user                  | Yes           |
| GET    | `/experiences`                 | Get all experiences of the logged-in user                 | Yes           |
| GET    | `/experiences/:id`             | Get a specific experience by its ID                       | Yes           |
| GET    | `/experiences/user/:userId`    | Get all experiences for any user by their user ID         | Yes           |
| PATCH  | `/experiences/:id`             | Update an experience by its ID (must be owner)            | Yes           |
| DELETE | `/experiences/:id`             | Delete an experience by its ID (must be owner)            | Yes           |

---

### Posts

| Method | Endpoint                  | Description                                        | Auth Required |
| ------ | ------------------------- | -------------------------------------------------- | ------------- |
| POST   | `/posts`                  | Create a new post                                  | Yes           |
| GET    | `/posts`                  | Get all posts (community feed)                     | Yes           |
| GET    | `/posts/:id`              | Get a single post by its ID                        | Yes           |
| GET    | `/posts/user/:userId`     | Get all posts by a specific user                   | Yes           |
| PATCH  | `/posts/:id`              | Update a post by its ID (must be owner)            | Yes           |
| DELETE | `/posts/:id`              | Delete a post by its ID (must be owner)            | Yes           |

---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```