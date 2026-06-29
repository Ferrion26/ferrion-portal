import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed always uses the direct connection to bypass pgbouncer prepared-statement limits.
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

async function main() {
  const adminHash = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ferrion.com" },
    update: {},
    create: {
      email: "admin@ferrion.com",
      name: "Portal Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const customerHash = await bcrypt.hash("customer1234", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "Jane Smith",
      company: "Acme GmbH",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });

  await prisma.order.upsert({
    where: { reference: "ORD-2024-001" },
    update: {},
    create: {
      reference: "ORD-2024-001",
      status: "DELIVERED",
      totalAmount: 4850.0,
      currency: "EUR",
      customerId: customer.id,
      lineItems: [
        { sku: "FER-100", description: "Steel bracket set", qty: 10, unitPrice: 485 },
      ],
    },
  });

  await prisma.quote.upsert({
    where: { reference: "QUO-2024-001" },
    update: {},
    create: {
      reference: "QUO-2024-001",
      status: "SENT",
      totalAmount: 12500.0,
      currency: "EUR",
      customerId: customer.id,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: [
        { sku: "FER-200", description: "Aluminium profile 2m", qty: 50, unitPrice: 250 },
      ],
    },
  });

  console.log("Seed complete. Admin:", admin.email, "| Customer:", customer.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
