-- Rename parent fields to contact fields on Member table
ALTER TABLE "Member" RENAME COLUMN "parentName" TO "contactName";
ALTER TABLE "Member" RENAME COLUMN "parentEmail" TO "contactEmail";
ALTER TABLE "Member" RENAME COLUMN "parentPhone" TO "contactPhone";
ALTER TABLE "Member" RENAME COLUMN "parentAccountId" TO "memberAccountId";

-- Drop old index and create new one for contactEmail
DROP INDEX IF EXISTS "Member_parentEmail_idx";
CREATE INDEX "Member_contactEmail_idx" ON "Member"("contactEmail");

-- Drop old index and create new one for memberAccountId
DROP INDEX IF EXISTS "Member_parentAccountId_idx";
CREATE INDEX "Member_memberAccountId_idx" ON "Member"("memberAccountId");

-- Rename ParentAccount table to MemberAccount
ALTER TABLE "ParentAccount" RENAME TO "MemberAccount";

-- Update foreign key constraint name (optional but cleaner)
ALTER TABLE "Member" DROP CONSTRAINT IF EXISTS "Member_parentAccountId_fkey";
ALTER TABLE "Member" ADD CONSTRAINT "Member_memberAccountId_fkey"
  FOREIGN KEY ("memberAccountId") REFERENCES "MemberAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
