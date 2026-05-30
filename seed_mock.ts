import { PrismaClient, Gender } from "@prisma/client";
import { MOCK_PATIENTS } from "./src/data/mockPatients";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding MOCK_PATIENTS into database...");

  // Get first organization and practitioner
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error("No organization found. Please run regular seed first.");

  const practitioner = await prisma.practitioner.findFirst();
  if (!practitioner) throw new Error("No practitioner found. Please run regular seed first.");

  let added = 0;
  let skipped = 0;

  for (const p of MOCK_PATIENTS) {
    const mrn = p.id; // e.g. "P-2024-001"
    
    // Check if exists
    const existing = await prisma.patient.findUnique({ where: { mrn } });
    if (existing) {
      skipped++;
      continue;
    }

    // Map gender
    let gender: Gender = Gender.UNKNOWN;
    if (p.gender.toLowerCase() === "female") gender = Gender.FEMALE;
    if (p.gender.toLowerCase() === "male") gender = Gender.MALE;
    if (p.gender.toLowerCase() === "other") gender = Gender.OTHER;

    // Default values if missing
    let dob = new Date();
    if (p.dateOfBirth) {
        dob = new Date(p.dateOfBirth);
        if (isNaN(dob.getTime())) dob = new Date();
    }

    await prisma.patient.create({
      data: {
        mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: dob,
        gender,
        organizationId: org.id,
        primaryPhysicianId: practitioner.id,
        
        telecoms: {
          create: p.phone ? [
            { system: "PHONE", value: p.phone, use: "HOME", isPrimary: true },
          ] : [],
        },
      }
    });

    added++;
    if (added % 50 === 0) console.log(`Inserted ${added} patients...`);
  }

  console.log(`\n✅ Finished seeding. Added ${added}, Skipped ${skipped} (already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
