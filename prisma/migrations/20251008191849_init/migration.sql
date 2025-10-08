-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serviceTier" TEXT NOT NULL,
    "lastAuditScore" INTEGER,
    "monthlyKeywords" INTEGER,
    "lastAuditDate" DATETIME,
    "nextAuditDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "backlinkScore" INTEGER NOT NULL,
    "uxScore" INTEGER NOT NULL,
    "apiCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "AuditRun_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TechnicalIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "howToFix" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnicalIssue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "AuditRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetaTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "currentTitle" TEXT,
    "currentDesc" TEXT,
    "recommendedTitle" TEXT,
    "recommendedDesc" TEXT,
    "missingTags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetaTag_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "AuditRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeywordTracked" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "currentRank" INTEGER,
    "previousRank" INTEGER,
    "volume" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "cpc" REAL NOT NULL,
    "url" TEXT NOT NULL,
    "serpFeatures" TEXT,
    "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeywordTracked_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywordId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingHistory_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "KeywordTracked" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Backlink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDomain" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "daScore" INTEGER,
    "spamScore" INTEGER,
    "firstSeen" DATETIME NOT NULL,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "Backlink_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "readability" REAL NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "keywordDensity" REAL NOT NULL,
    "internalLinks" INTEGER NOT NULL,
    "externalLinks" INTEGER NOT NULL,
    "images" INTEGER NOT NULL,
    "missingAltTags" INTEGER NOT NULL,
    "recommendations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentScore_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "AuditRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "impact" TEXT,
    "effort" TEXT,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "endpoint" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "TechnicalIssue_auditId_severity_idx" ON "TechnicalIssue"("auditId", "severity");

-- CreateIndex
CREATE INDEX "MetaTag_auditId_idx" ON "MetaTag"("auditId");

-- CreateIndex
CREATE INDEX "KeywordTracked_clientId_keyword_idx" ON "KeywordTracked"("clientId", "keyword");

-- CreateIndex
CREATE INDEX "RankingHistory_keywordId_checkedAt_idx" ON "RankingHistory"("keywordId", "checkedAt");

-- CreateIndex
CREATE INDEX "Backlink_clientId_status_idx" ON "Backlink"("clientId", "status");

-- CreateIndex
CREATE INDEX "ContentScore_auditId_idx" ON "ContentScore"("auditId");

-- CreateIndex
CREATE INDEX "Task_clientId_status_idx" ON "Task"("clientId", "status");

-- CreateIndex
CREATE INDEX "ApiUsage_clientId_timestamp_idx" ON "ApiUsage"("clientId", "timestamp");
