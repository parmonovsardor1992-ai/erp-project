ALTER TABLE "RefreshToken"
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

CREATE TABLE IF NOT EXISTS "AuthAuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuthAuditLog_userId_idx" ON "AuthAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuthAuditLog_action_idx" ON "AuthAuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuthAuditLog_createdAt_idx" ON "AuthAuditLog"("createdAt");
