-- Admins can suspend an account: it can't sign in and its sessions stop working.
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3);
