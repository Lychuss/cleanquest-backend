-- CreateTable
CREATE TABLE "character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ingameName" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 100,
    "attack" INTEGER NOT NULL DEFAULT 0,
    "critical" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL DEFAULT 0,
    "evasion" INTEGER NOT NULL DEFAULT 0,
    "resistance" INTEGER NOT NULL DEFAULT 0,
    "luck" INTEGER NOT NULL DEFAULT 0,
    "stamina" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "rewards" JSONB NOT NULL,

    CONSTRAINT "quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "character_userId_key" ON "character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quest_key_key" ON "quest"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_quest_userId_questId_key" ON "user_quest"("userId", "questId");

-- AddForeignKey
ALTER TABLE "character" ADD CONSTRAINT "character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quest" ADD CONSTRAINT "user_quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quest" ADD CONSTRAINT "user_quest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
