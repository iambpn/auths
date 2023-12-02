# Auths

Authentication System similar to Auth0

## Documentation:

### Getting Started: **setting up your project**

```sh
# File: .env
AUTHS_DB_URI: ""; # sqlite uri is supported
AUTHS_SECRET: ""; # secret to use while issuing jwt token / other token
AUTHS_JWT_EXPIRATION_TIME: string; # JWT token expiration time
AUTHS_LOGIN_TOKEN_EXPIRATION_TIME: string; # Login token expiration time
AUTHS_HASH_SALT_ROUNDS: string; # number of rounds to use while hashing password
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

```ts
// File: permission.json
{
  "isSeeded": false, // boolean: "false" if you want to run the seed. This value will be automaticaly set to "true" after the first seed

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

### Deep Dive

- Workflow diagram of Sign-up

  ![Sign Up Diagram](/workflow/Auths%20Signup%20Flow.png)

- Workflow diagram of Login

  ![login Diagram](/workflow/Auths%20Login%20Flow.png)

- Workflow diagram of forgot password and reset password

  ![Forgot Password](/workflow/Auths%20Forgot%20password%20and%20Reset%20Password.png)

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
function authsInit(app: Express, permissionFile?: string): void;
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
  additionalPayload?: Record<string, any>
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
 * Check if logged in user has the required permission.
 */
function requiredPermissions(permission_slugs: string[]): (req: Request, res: Response, next: NextFunction) => void;
```

### Types

Here are the list of exposed Typescript Types

```ts
type AuthsRequestUser<T = Record<string, any>>
```

## Examples

- [Project Setup Example](/backend/example/)
