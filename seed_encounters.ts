import { PrismaClient, EncounterStatus, EncounterClass, ClinicalStatus, VerificationStatus, MedicationStatus } from "@prisma/client";

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Seeding Encounters, Conditions, and Medications...");

  const patients = await prisma.patient.findMany({ take: 200 });
  const practitioner = await prisma.practitioner.findFirst();
  
  if (!practitioner) throw new Error("No practitioner found");

  const encounterTypes = [
    { type: "Office Visit", class: EncounterClass.AMBULATORY },
    { type: "Telehealth", class: EncounterClass.VIRTUAL },
    { type: "Urgent Care", class: EncounterClass.EMERGENCY },
    { type: "Follow-up", class: EncounterClass.AMBULATORY },
    { type: "Lab Review", class: EncounterClass.AMBULATORY },
  ];

  const statuses = [
    EncounterStatus.PLANNED, 
    EncounterStatus.ARRIVED, 
    EncounterStatus.IN_PROGRESS, 
    EncounterStatus.FINISHED,
    EncounterStatus.CANCELLED
  ];

  const conditions = [
    { code: "I10", display: "Essential Hypertension" },
    { code: "E11.9", display: "Type 2 Diabetes Mellitus" },
    { code: "E78.5", display: "Hyperlipidemia" },
    { code: "J01.90", display: "Acute sinusitis" },
    { code: "M54.5", display: "Low back pain" }
  ];

  const medications = [
    { code: "197361", display: "Lisinopril 10mg" },
    { code: "860975", display: "Metformin 500mg" },
    { code: "153165", display: "Atorvastatin 40mg" },
    { code: "308136", display: "Amoxicillin 500mg" },
    { code: "198440", display: "Ibuprofen 600mg" }
  ];

  let encCount = 0;
  let condCount = 0;
  let medCount = 0;

  for (const patient of patients) {
    // Generate 1-5 encounters per patient
    const numEncounters = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numEncounters; i++) {
      const eType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
      
      // mostly FINISHED, but some PLANNED (future)
      const randStatus = Math.random();
      const status = randStatus > 0.8 ? EncounterStatus.PLANNED : 
                     randStatus > 0.7 ? EncounterStatus.CANCELLED : 
                     EncounterStatus.FINISHED;

      // Dates: past 6 months to next 1 month
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      const periodStart = randomDate(start, end);
      
      const periodEnd = new Date(periodStart);
      periodEnd.setMinutes(periodEnd.getMinutes() + 30);

      await prisma.encounter.create({
        data: {
          identifier: `ENC-${patient.mrn}-${i}-${Math.floor(Math.random()*1000)}`,
          status,
          class: eType.class,
          type: eType.type,
          patientId: patient.id,
          practitionerId: practitioner.id,
          periodStart,
          periodEnd
        }
      });
      encCount++;
    }

    // Add 0-3 active conditions
    const numConds = Math.floor(Math.random() * 4);
    for (let i = 0; i < numConds; i++) {
      const cond = conditions[Math.floor(Math.random() * conditions.length)];
      await prisma.condition.create({
        data: {
          clinicalStatus: ClinicalStatus.ACTIVE,
          verificationStatus: VerificationStatus.CONFIRMED,
          code: cond.code,
          codeDisplay: cond.display,
          patientId: patient.id,
          onsetDate: new Date()
        }
      });
      condCount++;
    }

    // Add 0-3 active medications
    const numMeds = Math.floor(Math.random() * 4);
    for (let i = 0; i < numMeds; i++) {
      const med = medications[Math.floor(Math.random() * medications.length)];
      await prisma.medicationRequest.create({
        data: {
          status: MedicationStatus.ACTIVE,
          medicationCode: med.code,
          medicationDisplay: med.display,
          patientId: patient.id,
          requesterId: practitioner.id
        }
      });
      medCount++;
    }
  }

  console.log(`\n✅ Finished seeding:`);
  console.log(` - ${encCount} Encounters`);
  console.log(` - ${condCount} Conditions`);
  console.log(` - ${medCount} Medication Requests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
