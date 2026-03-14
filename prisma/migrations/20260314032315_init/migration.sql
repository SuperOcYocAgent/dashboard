-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "type" TEXT,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "estimatedHours" INTEGER,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'interested'
);

-- CreateIndex
CREATE INDEX "SavedJob_status_idx" ON "SavedJob"("status");

-- CreateIndex
CREATE INDEX "SavedJob_score_idx" ON "SavedJob"("score");
