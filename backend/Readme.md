# Auths

Authentication System inspired by Auth0. It is a plug and play authentication and authorization system with in `express` application. Auths provides different kinds of APIs and functions along with Auths [Dashboard](#app_preview) out of the box, allowing you to manage your users and their access. Currently, Auths has support for three different types of databases: mysql2, sqlite, and postgres, to store user data and credentials.

**Setup auths with 3 simple steps: [Go to Getting Started](#getting-started-setting-up-your-project-with-sqlite-db)**

- Install auths in to your existing express application
- Setup required environment variable
- Link your express app to auths

## Documentation:

### Getting Started: **setting up your project with sqlite db**

- Install Auths

  ```shell
  npm i @iambpn/auths
  ```

- Setup Env Variables

  ```sh
  # File: .env

  AUTHS_DB_DRIVER=sqlite
  AUTHS_DB_URI=""; # sqlite uri is only supported
  AUTHS_SECRET=""; # secret to use while issuing jwt token / other token
  AUTHS_JWT_EXPIRATION_TIME=string; # JWT token expiration time
  AUTHS_LOGIN_TOKEN_EXPIRATION_TIME=string; # Login token expiration time
  AUTHS_HASH_SALT_ROUNDS=string; # number of rounds to use while hashing password
  ```

- Inside of main.ts file

  ```ts
  // File: main.ts

  // Load Env
  dotenv.config();

  // initiate express server
  const app = express();

  // configure global middlewares
  app.use(express.json());
  ...

  // Initiate auth package
  authsInit(app, path.join(__dirname, "permission.json")).then(()=>{
    // Other Routes (Your backend APIs)
    ...

    // start your express server
    app.listen(8080, () => {
      console.log("listening on port 8080");
    });
  });
  ```

- Seeding Permission (Optional)

  Since seeding permission can be tedious, you can create a `permission.json` file in your project root and seed it automatically

  ```ts
  // File: permission.json
  {
    "isSeeded": false, // boolean: "false" if you want to run the seed. This value will be automatically set to "true" after the first seed

    // default permissions
    "permission": [
      { "name": "create", "slug": "create" },
      ...
    ]
  }
  ```

- Accessing `auths` `dashboard`:

  `<url>/auths` & default username and password: `admin@admin.com` and `admin123`

  **_Example:_** `http://localhost:8008/auths`

  **_Preview:_**
  <a id="app_preview"></a>

  ![Login Page](/app_preview/login.png)

  ![Dashboard Page](/app_preview/dashboard.png)

- **_Auths Seeds:_**

  By Default, on first boot-up auths will seed the following

  - New user with default superAdmin_admin role
  - New superAdmin_admin role

    Default `superAdmin_admin role` has no permission and can do anything inside of `auths dashboard` but cannot access the client side resource. To access client side resource, Admin needs to manually add required permissions to default `superAdmin_admin role`. Only Users with default super admin role can access and use `auths dashboard`.

    **_Note: Default super admin is identified by its slug `superAdmin__default` so default super admin is not deletable._**

### Deep Dive

- Workflow diagram of Sign-up

  ![Sign Up Diagram](/workflow/Auths%20Signup%20Flow.png)

- Workflow diagram of Login

  ![login Diagram](/workflow/Auths%20Login%20Flow.png)

- Workflow diagram of forgot password and reset password

  ![Forgot Password](/workflow/Auths%20Forgot%20password%20and%20Reset%20Password.png)

### List of ENV Variables

```ts
/*
  Secret key to encrypt auths jwt token.
*/
AUTHS_SECRET: string;

/*
  Auths Jwt token expiry time in Seconds
*/
AUTHS_JWT_EXPIRATION_TIME?: number;

/*
  Auths login token expiration time in MilliSeconds
*/
AUTHS_LOGIN_TOKEN_EXPIRATION_TIME?: number;

/*
  Number of salt rounds to use when encrypting password
*/
AUTHS_HASH_SALT_ROUNDS?: number;

/*
  Specifying Which Database Driver to Use

  Possible values:
    - 'better-sqlite'
    - 'mysql2'
    - 'node-postgres'
*/
AUTHS_DB_DRIVER: string;

/*
  Required if AUTHS_DB_DRIVER is 'better-sqlite'
*/
AUTHS_DB_URI?: string;

/*
  Required if AUTHS_DB_DRIVER is 'mysql2' or 'node-postgres'
*/
AUTHS_DB_HOST?: string;

/*
  Required if AUTHS_DB_DRIVER is 'mysql2' or 'node-postgres'
*/
AUTHS_DB_PORT?: number;

/*
  Required if AUTHS_DB_DRIVER is 'mysql2' or 'node-postgres'
*/
AUTHS_DB_USERNAME?: string;

/*
  Required if AUTHS_DB_DRIVER is 'mysql2' or 'node-postgres'
*/
AUTHS_DB_PASSWORD?: string;

/*
  Required if AUTHS_DB_DRIVER is 'mysql2' or 'node-postgres'
*/
AUTHS_DB_NAME?: string;
```

## API References

Two system i.e (Auths and your Backend System) should uniquely identify the user using either their email or auths returned uuid.

### Consumable REST APIs

Here are the list of exposed apis users can consume.

```
### Get User Login Token API
GET {URL}/auths/login HTTP/1.1
Content-Type: application/json

{
  email: string;
  password: string;
}
```

```
### User Reset Password API
GET {URL}/auths/resetPassword HTTP/1.1
Content-Type: application/json

{
  email: string;
  token: string; // Token returned from InitiateForgotPassword function
  newPassword: string;
}
```

```
### Get Current User
GET {URL}/auths/currentUser HTTP/1.1
```

### Exported Functions

Here are the list of function that can be used to interact with auths system from backend directly.

```ts
function authsInit(app: Express, permissionFileUrl?: string): void;
```

```ts
function signup(
  email: string,
  password: string,
  roleSlug: string,
  others?: Record<string, any>
): Promise<{
  email: string;
  uuid: string;
  role: string;
}>;
```

```ts
function login(
  token: string, // Token returned from /auths/login API endpoint
  email: string,
  additionalPayload?: Record<string, any> // additional payload to store in jwt
): Promise<{
  email: string;
  uuid: string;
  jwtToken: string;
}>;
```

```ts
function validateUser(email: string): Promise<{
  uuid: string;
  email: string;
  others: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;
```

```ts
function initiateForgotPasswordFn(
  email: string,
  returnToken?: string | undefined
): Promise<{
  email: string;
  token: string;
  expires_at: Date;
}>;
```

```ts
function getUserById(id: string): Promise<{
  role: {
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
  };
  uuid: string;
  email: string;
  others: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;
```

### Middlewares

Here are the list of middlewares that can be used inside of your express application.

```ts
/**
 * Check if user is authenticated via bearer token.
 */
function isAuthenticated(req: Request, res: Response, next: NextFunction): void;
```

```ts
/**
 * Check if user has required permission to access resources
 */
function requiredPermissions(permission_slugs: string[]): (req: Request, res: Response, next: NextFunction) => void;
```

### Types

Here are the list of exposed Typescript Types

```ts
type AuthsRequestUser<T = Record<string, any>>
```

## Limitation:

- Currently only `better-sqlite3`, `node-postgres` and `mysql2` db drivers are only supported.

## Challenges

- Due to the use of drizzle orm supporting multiple databases was a difficult task. To support multiple databases it required me to do some TS type fiddling and type error suppression and also required different migrations for each database. I think, this could have been prevented if i had used different orm like sequelize or typeorm (which out of the box supported different sql databases) with the tradeoff of losing drizzles end to end TS type safety.

- Since the drizzle is new for me i felt particularly difficult in reusing the same conditional logic with different select parameters (columns). Either, i had to rewrite the same query condition with different select parameters (columns) or i have to settle for fetching all the columns and manually discarding the unwanted columns.

## Changelog

- 1.0.0
  - Auths Released
  - Added `Sqlite` database is supported
  - Added `Authentication` and `Authorization` support
- 2.0.0:
  - Adding support for ` mysql2` and `postgres` database
  - Added User management system
  - Added more env variables
  - **Breaking**: `Auths` function is now async
  - **Breaking**: `AUTHS_DB_DRIVER` env variable is now required.
- 2.0.1 (Pending Release)
  - Exposed `getUserById` function for backend system interactions
  - [Bug Fix] - Adding missing pagination in frontend

## Examples

- [Project Setup Example (TS)](/backend/example/)
- [Ready to go example (JS)](https://github.com/iambpn/auths_example)
