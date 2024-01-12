# Auths

Authentication System similar to Auth0

## Documentation:

### Getting Started: **setting up your project with sqlite db**

```sh
# File: .env
AUTHS_DB_DRIVER=sqlite
AUTHS_DB_URI=""; # sqlite uri is only supported
AUTHS_SECRET=""; # secret to use while issuing jwt token / other token
AUTHS_JWT_EXPIRATION_TIME=string; # JWT token expiration time
AUTHS_LOGIN_TOKEN_EXPIRATION_TIME=string; # Login token expiration time
AUTHS_HASH_SALT_ROUNDS=string; # number of rounds to use while hashing password
```

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
authsInit(app, path.join(__dirname, "permission.json"));
```

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

- Accessing auths dashboard:

  `<url>/auths` & default username and password: `admin@admin.com` and `admin123`

  Example: `http://localhost:8008/auths`

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

## List of ENV Variables

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

### Consumable REST APIs

Here are the list of exposed apis users can consume.

```
### User Login
GET {URL}/auths/login HTTP/1.1
Content-Type: application/json

{
  email: string;
  password: string;
}
```

```
### User Reset Password
GET {URL}/auths/resetPassword HTTP/1.1
Content-Type: application/json

{
  email: string;
  token: string;
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
function loginFn(
  token: string,
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

- Currently only `better-sqlite3`, `node-postgres` and `mysql2` db are only supported.

## Examples

- [Project Setup Example](/backend/example/)
