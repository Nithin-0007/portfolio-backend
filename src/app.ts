import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { info, arguments: args } = event;
  const fieldName = info.fieldName;

  try {
    switch (fieldName) {
      // --- Queries ---
      case 'getPortfolio': return await getPortfolio(args.username);
      case 'getSkills': return await getSkills(args.username);
      case 'getProjects': return await getProjects(args.username);
      case 'getExperiences': return await getExperiences(args.username);
      case 'getAchievements': return await getAchievements(args.username);
      case 'getEvents': return await getEvents(args.username);
      case 'getMessages': return await getMessages(args.username);
      case 'getNotifications': return await getNotifications(args.username);

      // --- Mutations ---
      case 'saveHero': return await saveHero(args.userId, args.input);
      case 'saveAbout': return await saveAbout(args.userId, args.input);
      
      case 'upsertProject': return await upsertProject(args.userId, args.input);
      case 'deleteProject': return await deleteProject(args.id);
      
      case 'upsertSkill': return await upsertSkill(args.userId, args.input);
      case 'deleteSkill': return await deleteSkill(args.id);
      
      case 'upsertExperience': return await upsertExperience(args.userId, args.input);
      case 'deleteExperience': return await deleteExperience(args.id);

      case 'upsertAchievement': return await upsertAchievement(args.userId, args.input);
      case 'deleteAchievement': return await deleteAchievement(args.id);

      case 'upsertEvent': return await upsertEvent(args.userId, args.input);
      case 'deleteEvent': return await deleteEvent(args.id);

      case 'sendMessage': return await sendMessage(args.targetUsername, args);
      case 'chatWithAI': return await chatWithAI(args.message, args.sessionId, args.history);

      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};

// ==================== QUERIES ====================

async function getPortfolio(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      heroContent: true,
      aboutContent: true,
      projects: { where: { published: true }, orderBy: { order: 'asc' } },
      skills: { orderBy: { order: 'asc' } },
      experiences: { orderBy: { order: 'asc' } },
      achievements: { orderBy: { order: 'asc' } },
      events: { orderBy: { date: 'asc' } },
      siteSettings: true
    }
  });

  if (!user) return null;

  return {
    user,
    hero: user.heroContent[0],
    about: user.aboutContent[0],
    projects: user.projects,
    skills: user.skills,
    experiences: user.experiences,
    achievements: user.achievements,
    events: user.events,
    siteSettings: user.siteSettings[0]
  };
}

async function getSkills(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.skill.findMany({ where: { userId: user.id }, orderBy: { order: 'asc' } });
}

async function getProjects(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.project.findMany({ where: { userId: user.id, published: true }, orderBy: { order: 'asc' } });
}

async function getExperiences(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.experience.findMany({ where: { userId: user.id }, orderBy: { order: 'asc' } });
}

async function getAchievements(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.achievement.findMany({ where: { userId: user.id }, orderBy: { order: 'asc' } });
}

async function getEvents(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.event.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } });
}

async function getMessages(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.contactMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
}

async function getNotifications(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return [];
  return await prisma.notification.findMany({
    where: { OR: [{ userId: user.id }, { broadcast: true }] },
    orderBy: { createdAt: 'desc' }
  });
}

// ==================== MUTATIONS ====================

async function saveHero(userId: string, input: any) {
  return await prisma.heroContent.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input }
  });
}

async function saveAbout(userId: string, input: any) {
  return await prisma.aboutContent.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input }
  });
}

async function upsertProject(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) {
    return await prisma.project.update({ where: { id }, data });
  }
  return await prisma.project.create({ data: { userId, ...data } });
}

async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  return true;
}

async function upsertSkill(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) {
    return await prisma.skill.update({ where: { id }, data });
  }
  return await prisma.skill.create({ data: { userId, ...data } });
}

async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } });
  return true;
}

async function upsertExperience(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) {
    return await prisma.experience.update({ where: { id }, data });
  }
  return await prisma.experience.create({ data: { userId, ...data } });
}

async function deleteExperience(id: string) {
  await prisma.experience.delete({ where: { id } });
  return true;
}

async function upsertAchievement(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) {
    return await prisma.achievement.update({ where: { id }, data });
  }
  return await prisma.achievement.create({ data: { userId, ...data } });
}

async function deleteAchievement(id: string) {
  await prisma.achievement.delete({ where: { id } });
  return true;
}

async function upsertEvent(userId: string, input: any) {
  const { id, ...data } = input;
  if (data.date) data.date = new Date(data.date);
  if (data.endDate) data.endDate = new Date(data.endDate);
  
  if (id) {
    return await prisma.event.update({ where: { id }, data });
  }
  return await prisma.event.create({ data: { userId, ...data } });
}

async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  return true;
}

async function sendMessage(targetUsername: string, args: any) {
  const user = await prisma.user.findUnique({ where: { username: targetUsername } });
  if (!user) throw new Error('Recipient user not found');
  
  return await prisma.contactMessage.create({
    data: {
      userId: user.id,
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message
    }
  });
}

async function chatWithAI(message: string, sessionId: string, history: any[]) {
  // Mock response for verification. 
  // In production, you would call your LLM endpoint here.
  return {
    id: `msg_${Date.now()}`,
    sessionId,
    role: 'assistant',
    content: `GraphQL Lambda received: "${message}". Cloud LLM integration is ready for setup.`,
    createdAt: new Date().toISOString()
  };
}
