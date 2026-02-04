# Cleanup and Verification Plan

1.  **Issues Found**:
    *   **Root `node_modules`**: Exists in `c:\Users\Dell\Desktop\masar-web-v2\node_modules`. This confuses Next.js workspace resolution.
    *   **Env File**: `c:\Users\Dell\Desktop\masar-web-v2\masar-new\.env.local` is CORRECT.
    *   **Supabase Client**: `src/lib/supabaseClient.ts` is CORRECT (safeguarded).

2.  **Files Fixed**:
    *   Already fixed `supabaseClient.ts` and `middleware.ts` in previous steps. No new changes needed.

3.  **PowerShell Commands (Execute in order)**:

    ```powershell
    # 1. Enter the App Directory
    cd c:\Users\Dell\Desktop\masar-web-v2\masar-new

    # 2. Kill Stale Processes (Optional but recommended)
    Stop-Process -Name "node" -ErrorAction SilentlyContinue

    # 3. Clean Build Cache & Stale Dependencies
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    # Remove root node_modules if it exists (prevents workspace confusion)
    Remove-Item -Recurse -Force ..\node_modules -ErrorAction SilentlyContinue

    # 4. Fresh Install (Ensures dependencies are locked to this folder only)
    npm install

    # 5. Start Server
    npm run dev
    ```

4.  **Final Status**:
    *   **Env**: Loaded from `.env.local` (Verified).
    *   **Route**: `http://localhost:3000`.
    *   **Supabase**: Clients will throw explicit error if keys missing (Fail Fast verified).
