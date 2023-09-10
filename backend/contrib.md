# Auths

## Adding New Schema to DB

- Create new schema in `drizzle-schema.ts`
- Run drizzle kit generate: `npx drizzle-kit generate:sqlite` or `npm run drizzle:generate`
- Run drizzle migration via code or command `npx drizzle-kit up:sqlite`

## Required Node Version

- Node >= 14.21.1

## Envs

- `AUTHS_DB_PATH`: Path to AUTHS DB.
- `AUTHS_SECRET`: Auths Secret token.
- `AUTHS_JWT_EXPIRATION_TIME`: Auths jwt expiration time. default is 1 day. _Value is expressed in seconds or a string describing a time span [vercel/ms](https://github.com/vercel/ms)._

_update `_env.type.ts` to add additional types to `process.env`._

## Resources:

- [DrizzleOrm - sqlite](https://orm.drizzle.team/docs/column-types/sqlite)
- [Drizzle Kysely repo](https://github.com/drizzle-team/drizzle-kysely)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [kysely](https://kysely.dev/docs/getting-started?dialect=sqlite)
