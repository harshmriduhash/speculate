import prisma from "@/lib/prisma";

async function main() {
  console.log("Seeding database with demo data...");

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      credits: 100,
    },
  });

  // Create a demo project
  const project = await prisma.project.upsert({
    where: { name: "Demo Project" },
    update: {},
    create: {
      name: "Demo Project",
      description: "A seeded demo project with a sample flow",
      isPublic: true,
      userId: user.id,
    },
  });

  // Create a sample chart/flow (simple JSON content stored in content field)
  const sampleContent = JSON.stringify({
    nodes: [
      { id: "start", type: "start", label: "Start" },
      { id: "q1", type: "question", label: "Are you happy?" },
      { id: "end", type: "end", label: "Thanks" },
    ],
    edges: [
      { from: "start", to: "q1" },
      { from: "q1", to: "end" },
    ],
  });

  await prisma.chartInstance.upsert({
    where: { name: "Demo Flow" },
    update: {},
    create: {
      name: "Demo Flow",
      content: sampleContent,
      userId: user.id,
      projectId: project.id,
      isPublished: true,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
