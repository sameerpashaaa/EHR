import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting portal migration...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    let portal: any = "STAFF";
    switch (user.role) {
      case "ADMIN":
        portal = "ADMIN_PORTAL";
        break;
      case "PHYSICIAN":
        portal = "PHYSICIAN_PORTAL";
        break;
      case "NURSE":
      case "MEDICAL_ASSISTANT":
        portal = "CLINICAL_PORTAL";
        break;
      case "FRONT_DESK":
        portal = "RECEPTION_PORTAL";
        break;
      case "PATIENT":
        portal = "PATIENT_PORTAL";
        break;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginPortal: portal },
    });
  }

  console.log(`Migrated ${users.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
