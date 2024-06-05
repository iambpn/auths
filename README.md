# Auths

Authentication System Inspired by Auth0

**Links to Documentation: [Docs.md](/backend/Readme.md)**

**Links to NPM Package: [Npm](https://www.npmjs.com/package/@iambpn/auths)**

# Commands to setup the project for development.

- `npm init -w <work-space-name>`: Create workspace folder
- `npm run <script name> <npm-options> -w <workspace-name> -- <script options>` : Run script

# Package.json Scripts

- `Dev: npm run dev`: runs both `frontend` and `backend` project sequentially.
- `Build: npm run build`: Runs `build` command in all workspaces
- `Pack: npm run pack`: Packs the package into tarball so that it can be inspected
- `Version: npm run version [args: major | minor | patch]`: Increment the `package.json` version of backend.
- `Publish: npm run publish:dry`: Dry run `npm run publish` to check its contents
- `Publish: npm run publish`: Publish the package to the npm registry

# Steps to test package

- `npm run pack`: Packs `auths` into a tarball
- Extract tarball and setup test project.
- Run Project
- `npm run publish:dry`: Runs `npm publish` command without publishing it to npm registry and check publish log.

# Contribution Docs

- [contrib.md](/backend/contrib.md)

# References

- [NPM Commands](https://docs.npmjs.com/cli/v7/commands/npm)
- [NPM Workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [ts-node-dev](https://www.npmjs.com/package/ts-node-dev)
