import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@nithish.dev";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@123456";
  const hashedPwd = await bcrypt.hash(adminPass, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: "admin",
      name: "Nithish Kumar",
      email: adminEmail,
      password: hashedPwd,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Hero Content
  const heroCount = await prisma.heroContent.count();
  if (heroCount === 0) {
    await prisma.heroContent.create({
      data: {
        userId: admin.id,
        greeting: "Hello, World! I'm",
        name: "Nithish Kumar",
        roles: ["Full-Stack Developer", "UI/UX Enthusiast", "AI Integrations Builder", "Open Source Contributor"],
        description: "I craft beautiful, high-performance web experiences that delight users and drive results. Passionate about clean code, cutting-edge tech, and turning ideas into reality.",
      },
    });
    console.log("✅ Hero content seeded");
  }

  // About Content
  const aboutCount = await prisma.aboutContent.count();
  if (aboutCount === 0) {
    await prisma.aboutContent.create({
      data: {
        userId: admin.id,
        bio1: "Hey! I'm Nithish Kumar — a passionate full-stack developer with a love for building products that are both technically robust and beautifully designed.",
        bio2: "I specialize in the JavaScript ecosystem — React, Next.js, Node.js — and I'm always exploring new technologies like AI integrations, serverless architectures, and edge computing.",
        highlights: ["Problem Solver", "Clean Code Advocate", "Team Player", "Lifelong Learner"],
        location: "Chennai, Tamil Nadu, India",
        email: "nithish@example.com",
        phone: "+91 98765 43210",
        availability: "Open to opportunities",
      },
    });
    console.log("✅ About content seeded");
  }

  // Skill Categories
  const catCount = await prisma.skillCategory.count();
  if (catCount === 0) {
    const categories = [
      { userId: admin.id, title: "Frontend", icon: "⚛️", color: "#7c3aed", skills: ["React", "Next.js", "TypeScript", "CSS/SCSS", "Tailwind", "Framer Motion"], order: 0 },
      { userId: admin.id, title: "Backend", icon: "🔧", color: "#06b6d4", skills: ["Node.js", "Express", "FastAPI", "Python", "REST APIs", "GraphQL"], order: 1 },
      { userId: admin.id, title: "Database", icon: "🗄️", color: "#f59e0b", skills: ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Supabase", "Firebase"], order: 2 },
      { userId: admin.id, title: "DevOps & Cloud", icon: "☁️", color: "#ec4899", skills: ["Docker", "AWS", "Vercel", "GitHub Actions", "Linux", "Nginx"], order: 3 },
      { userId: admin.id, title: "AI / ML", icon: "🤖", color: "#22c55e", skills: ["LangChain", "OpenAI API", "Ollama", "Hugging Face", "Pinecone", "RAG"], order: 4 },
      { userId: admin.id, title: "Tools", icon: "🛠️", color: "#f97316", skills: ["Git/GitHub", "VS Code", "Figma", "Postman", "Jira", "Notion"], order: 5 },
    ];
    await prisma.skillCategory.createMany({ data: categories });
    console.log("✅ Skill categories seeded");
  }

  // Skills (proficiency)
  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    const skills = [
      { userId: admin.id, label: "React / Next.js", value: 92, category: "Frontend", order: 0 },
      { userId: admin.id, label: "TypeScript / JavaScript", value: 90, category: "Frontend", order: 1 },
      { userId: admin.id, label: "Node.js / Express", value: 85, category: "Backend", order: 2 },
      { userId: admin.id, label: "Python / FastAPI", value: 78, category: "Backend", order: 3 },
      { userId: admin.id, label: "Database Design", value: 82, category: "Database", order: 4 },
      { userId: admin.id, label: "UI/UX Design", value: 75, category: "Design", order: 5 },
      { userId: admin.id, label: "DevOps / Cloud", value: 70, category: "DevOps", order: 6 },
      { userId: admin.id, label: "AI Integrations", value: 80, category: "AI/ML", order: 7 },
    ];
    await prisma.skill.createMany({ data: skills });
    console.log("✅ Skills seeded");
  }

  // Projects
  const projCount = await prisma.project.count();
  if (projCount === 0) {
    await prisma.project.createMany({
      data: [
        { userId: admin.id, title: "AI Chat Platform", description: "Full-stack chat application powered by Ollama local LLMs. Real-time streaming, conversation history, multi-model support.", tags: ["Next.js", "Ollama", "TypeScript", "WebSockets", "PostgreSQL"], category: "AI/ML", icon: "🤖", color: "#7c3aed", github: "https://github.com", featured: true, order: 0 },
        { userId: admin.id, title: "E-Commerce Dashboard", description: "Modern admin dashboard for managing products, orders, and analytics with real-time charts and role-based access.", tags: ["React", "Node.js", "MongoDB", "Chart.js", "JWT"], category: "Full-Stack", icon: "📊", color: "#06b6d4", github: "https://github.com", featured: true, order: 1 },
        { userId: admin.id, title: "SaaS Landing Builder", description: "Drag-and-drop landing page builder with component library, custom themes, and one-click deploy.", tags: ["Next.js", "TypeScript", "Supabase", "Stripe", "Vercel"], category: "Web App", icon: "🎨", color: "#ec4899", github: "https://github.com", order: 2 },
        { userId: admin.id, title: "DevDocs RAG Engine", description: "Retrieval-Augmented Generation system that indexes documentation and answers developer questions with citations.", tags: ["Python", "LangChain", "Pinecone", "FastAPI", "OpenAI"], category: "AI/ML", icon: "📚", color: "#22c55e", github: "https://github.com", order: 3 },
      ],
    });
    console.log("✅ Projects seeded");
  }

  // Experience
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    await prisma.experience.createMany({
      data: [
        { userId: admin.id, role: "Senior Full-Stack Developer", company: "TechCorp Solutions", period: "2024 – Present", type: "Full-Time", icon: "🏢", color: "#7c3aed", points: ["Led development of a multi-tenant SaaS platform serving 10,000+ users", "Architected microservices with Node.js, reducing API response time by 40%", "Built AI-powered features using LangChain and OpenAI APIs"], order: 0 },
        { userId: admin.id, role: "Frontend Developer", company: "Innovate Labs", period: "2022 – 2024", type: "Full-Time", icon: "⚡", color: "#06b6d4", points: ["Developed 15+ responsive React applications with pixel-perfect UI", "Improved Core Web Vitals scores by 35%", "Integrated 20+ third-party APIs and payment gateways"], order: 1 },
      ],
    });
    console.log("✅ Experience seeded");
  }

  // Settings
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    await prisma.settings.create({
      data: {
        ollamaModel: "llama3:latest",
        chatEnabled: true,
        portfolioTitle: "Nithish Kumar | Full-Stack Developer",
        systemPrompt: "You are an AI assistant for Nithish Kumar's professional portfolio. Be helpful, professional, and concise. Answer questions about his skills, projects, and background.",
      },
    });
    console.log("✅ Settings seeded");
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`\n🔑 Admin Login: ${adminEmail} / ${adminPass}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
