CREATE TABLE IF NOT EXISTS "PopupSettings" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "popupEnabled" BOOLEAN NOT NULL DEFAULT false,
  "popupImage" TEXT,
  "popupTargetUrl" TEXT DEFAULT '/#contact',
  "popupButtonText" TEXT DEFAULT 'להשארת פרטים',
  "popupDelay" INTEGER NOT NULL DEFAULT 1,
  "popupFrequency" TEXT NOT NULL DEFAULT 'daily',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);