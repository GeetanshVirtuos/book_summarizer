-- CreateTable
CREATE TABLE "ipAddress" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "ipAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToipAddress" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToipAddress_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ipAddress_address_key" ON "ipAddress"("address");

-- CreateIndex
CREATE INDEX "_UserToipAddress_B_index" ON "_UserToipAddress"("B");

-- AddForeignKey
ALTER TABLE "_UserToipAddress" ADD CONSTRAINT "_UserToipAddress_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToipAddress" ADD CONSTRAINT "_UserToipAddress_B_fkey" FOREIGN KEY ("B") REFERENCES "ipAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
