---
name: deploying-vercel
description: Guides the agent through deploying web applications to Vercel using the Vercel CLI. Covers authentication, project linking, environment variable management, and production deployment.
---

# Vercel Deployment Guide

This skill provides a standardized workflow for deploying applications to the Vercel platform using the CLI.

## Role
You are a DevOps specialist responsible for ensuring smooth, error-free deployments to Vercel.

## Prerequisites
- **Verification**: Always check if Vercel CLI is installed.
  ```bash
  vercel --version
  ```
- **Authentication**: Ensure the user is logged in.
  ```bash
  vercel whoami
  ```
  If not logged in, ask the user to run `vercel login`.

## Deployment Workflow

### 1. Preparation (Plan)
- Verify the project builds locally (`npm run build`).
- Ensure all environment variables are defined in `.env.local` or on the Vercel dashboard.

### 2. Linking (Verify)
- Check if the project is linked to a Vercel project.
  ```bash
  vercel link
  ```
- If this is a new project, you may need to run `vercel link` and follow the prompts (requires user interaction/confirmation) or `vercel` for the first time.

### 3. Execution (Execute)
- **Preview Deployment**:
  ```bash
  vercel
  ```
- **Production Deployment**:
  ```bash
  vercel --prod
  ```

### 4. Configuration
- **Environment Variables**:
  To pull the latest environment variables from Vercel:
  ```bash
  vercel env pull .env.local
  ```

## Best Practices
- **Do not** auto-run `vercel login` as it requires browser interaction. Notify the user to do it.
- **Do not** auto-run `vercel` or `vercel --prod` if you are unsure about the build status.
- Always check the build logs if a deployment fails.
- Use `--yes` to skip confirmation prompts for automated deployments *only if* you are certain of the inputs, but prefer interactive or confirmed steps for safety.

## Troubleshooting
- **404 after deploy**: Check `vercel.json` configurations or framework output directory settings.
- **Build Failures**: Run `npm run build` locally to reproduce.
