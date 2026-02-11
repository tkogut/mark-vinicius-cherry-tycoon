# Automated Deployment Plan (Playground)

This guide outlines the steps to set up automated deployment to the Internet Computer (ICP) Playground using GitHub Actions.

## 1. Prerequisites

- **GitHub Repository**: Ensure your project is pushed to GitHub.
- **DFX Version**: The workflow will install a specific version of `dfx`. Check your local version with `dfx --version` and update the workflow file accordingly if needed.
- **Node.js**: Required for building the frontend.

## 2. Configuration (`dfx.json`)

Ensure your `dfx.json` is configured correctly. For the Playground, standard settings usually work, but verify:

```json
{
  "networks": {
    "playground": {
      "providers": ["https://icp0.io"],
      "type": "ephemeral"
    }
  }
}
```
*Note: `dfx` often has a built-in `playground` network, so explicit configuration might not be strictly necessary, but good for clarity.*

## 3. GitHub Actions Workflow

Create a file at `.github/workflows/deploy-playground.yml` with the following content.

```yaml
name: Deploy to ICP Playground

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allows manual triggering

jobs:
  deploy-playground:
    runs-on: ubuntu-latest
    name: Deploy to Playground
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Install DFX
        uses: aviate-labs/setup-dfx@v1
        with:
          dfx-version: '0.24.3' # Match your local version if possible

      - name: Confirm DFX Installation
        run: dfx --version

      - name: Deploy to Playground
        env:
          # No identity is strictly required for *initial* playground deploy,
          # but for updates, you'd need to restore an identity. 
          # For a "fresh" playground deploy every time (new canister IDs), use ephemeral.
          DFX_NETWORK: playground
        run: |
          # Deploying to publicly hosted playground
          # Note: --with-cycles is not strictly needed for playground as it handles cycles automatically for temporary canisters
          dfx deploy --network playground 
          
          echo "Deployment complete."
          # Display canister IDs if available
          if [ -f .dfx/playground/canister_ids.json ]; then
            cat .dfx/playground/canister_ids.json
          fi

```

### Important Notes on Playground
- **Ephemeral**: Canisters on the playground are removed after **20 minutes**.
- **Cycles**: Playground deploys simulate free cycles.
- **Persistence**: Since playground canisters are temporary, this workflow is best for **Integration Testing** or **Quick Previews**, not for hosting a persistent dev version.

## 4. Secrets (Optional for Playground)

For a real Mainnet deploy, you would need `DFX_IDENTITY_PEM`. For Playground:
- You usually don't need a specific identity if you accept getting new canister IDs every time.
- If you want to *update* an existing playground canister (within its 20m life), you'd need the same identity. In CI, it's easier to just treat each deploy as fresh.

## 5. Execution

1. Commit and push the `.github/workflows/deploy-playground.yml` file.
2. Go to the **Actions** tab in your GitHub repository.
3. Watch the workflow run.
4. Check the "Deploy to Playground" step logs for the **Canister URL**.

## Next Steps

- [ ] Create `.github/workflows/deploy-playground.yml`
- [ ] Push to GitHub
- [ ] Verify success