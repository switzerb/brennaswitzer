-- The revision history of a piece of writing, read out of git at seed time.
CREATE TABLE "Revision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postSlug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "subject" TEXT NOT NULL,
    "commit" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Revision_postSlug_fkey" FOREIGN KEY ("postSlug") REFERENCES "Post" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Revision_postSlug_idx" ON "Revision"("postSlug");
