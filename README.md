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

### App

| Method | Endpoint | Description   | Auth Required |
| ------ | -------- | ------------- | ------------- |
| GET    | `/`      | Get hello msg | No            |

### Auth

| Method | Endpoint         | Description              | Auth Required |
| ------ | ---------------- | ------------------------ | ------------- |
| POST   | `/auth/register` | Register a new developer | No            |
| POST   | `/auth/login`    | Login, returns JWT       | No            |

### Users

| Method | Endpoint          | Description               | Auth Required |
| ------ | ----------------- | ------------------------- | ------------- |
| GET    | `/users`          | Get all developers        | Yes           |
| GET    | `/users/:id`      | Get a developer's profile | Yes           |
| PATCH  | `/users`          | Update own profile        | Yes           |
| PATCH  | `/users/password` | Update own password       | Yes           |
| DELETE | `/users`          | Delete own profile        | Yes           |

### Skills

| Method | Endpoint      | Description             | Auth Required |
| ------ | ------------- | ----------------------- | ------------- |
| POST   | `/skills`     | Add a skill             | Yes           |
| GET    | `/skills`     | Get all own skills      | Yes           |
| GET    | `/skills/:id` | Get a specific skill    | Yes           |
| PATCH  | `/skills`     | Update an own skill     | Yes           |
| DELETE | `/skills`     | Delete an own skill     | Yes           |

### Experiences

| Method | Endpoint           | Description                 | Auth Required |
| ------ | ------------------ | --------------------------- | ------------- |
| POST   | `/experiences`     | Add an experience           | Yes           |
| GET    | `/experiences`     | Get all own experiences     | Yes           |
| GET    | `/experiences/:id` | Get a specific experience   | Yes           |
| PATCH  | `/experiences`     | Update an own experience    | Yes           |
| DELETE | `/experiences`     | Delete an own experience    | Yes           |

### Posts

| Method | Endpoint     | Description          | Auth Required |
| ------ | ------------ | -------------------- | ------------- |
| POST   | `/posts`     | Create a post        | Yes           |
| GET    | `/posts`     | Get all posts (feed) | Yes           |
| GET    | `/posts/:id` | Get a single post    | Yes           |
| PATCH  | `/posts`     | Update own post      | Yes           |
| DELETE | `/posts`     | Delete own post      | Yes           |

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