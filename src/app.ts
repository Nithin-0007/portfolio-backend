import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pageInfo(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

function pagination(args: any) {
  const page = Math.max(1, args.page || 1);
  const limit = Math.min(100, Math.max(1, args.limit || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function sortOrder(args: any, defaultField = 'order') {
  return { [args.sortBy || defaultField]: args.sortOrder === 'desc' ? 'desc' : 'asc' };
}

export const handler = async (event: any) => {
  const { info, arguments: args } = event;
  const fieldName = info.fieldName;

  try {
    switch (fieldName) {
      case 'getPortfolio':       return await getPortfolio(args.username);
      case 'getProjects':        return await getProjects(args);
      case 'getSkills':          return await getSkills(args);
      case 'getExperiences':     return await getExperiences(args);
      case 'getAchievements':    return await getAchievements(args);
      case 'getEvents':          return await getEvents(args);
      case 'getMessages':        return await getMessages(args);
      case 'getNotifications':   return await getNotifications(args);

      case 'saveHero':           return await saveHero(args.userId, args.input);
      case 'saveAbout':          return await saveAbout(args.userId, args.input);

      case 'upsertProject':      return await upsertProject(args.userId, args.input);
      case 'deleteProject':      return await deleteById('project', args.id);

      case 'upsertSkill':        return await upsertSkill(args.userId, args.input);
      case 'deleteSkill':        return await deleteById('skill', args.id);

      case 'upsertExperience':   return await upsertExperience(args.userId, args.input);
      case 'deleteExperience':   return await deleteById('experience', args.id);

      case 'upsertAchievement':  return await upsertAchievement(args.userId, args.input);
      case 'deleteAchievement':  return await deleteById('achievement', args.id);

      case 'upsertEvent':        return await upsertEvent(args.userId, args.input);
      case 'deleteEvent':        return await deleteById('event', args.id);

      case 'deleteMessage':      return await deleteById('contactMessage', args.id);
      case 'markMessageRead':    return await markMessageRead(args.id);

      case 'sendMessage':        return await sendMessage(args.targetUsername, args);
      case 'chatWithAI':         return await chatWithAI(args.message, args.sessionId, args.history);

      default: throw new Error(`Unknown field: ${fieldName}`);
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
      siteSettings: true,
    },
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
    siteSettings: user.siteSettings[0],
  };
}

async function getProjects(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (!args.admin) where.published = true;
  if (args.category) where.category = args.category;
  if (args.featured !== undefined) where.featured = args.featured;
  if (args.published !== undefined && args.admin) where.published = args.published;
  if (args.search) where.OR = [
    { title: { contains: args.search, mode: 'insensitive' } },
    { description: { contains: args.search, mode: 'insensitive' } },
    { category: { contains: args.search, mode: 'insensitive' } },
  ];

  const [items, total] = await Promise.all([
    prisma.project.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.project.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getSkills(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.category) where.category = args.category;
  if (args.search) where.OR = [
    { label: { contains: args.search, mode: 'insensitive' } },
    { category: { contains: args.search, mode: 'insensitive' } },
  ];

  const [items, total] = await Promise.all([
    prisma.skill.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.skill.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getExperiences(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.type) where.type = args.type;
  if (args.search) where.OR = [
    { role: { contains: args.search, mode: 'insensitive' } },
    { company: { contains: args.search, mode: 'insensitive' } },
  ];

  const [items, total] = await Promise.all([
    prisma.experience.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.experience.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getAchievements(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.search) where.title = { contains: args.search, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.achievement.findMany({ where, orderBy: sortOrder(args), skip, take: limit }),
    prisma.achievement.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getEvents(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.type) where.type = args.type;
  if (args.status) where.status = args.status;
  if (args.featured !== undefined) where.featured = args.featured;
  if (args.search) where.OR = [
    { title: { contains: args.search, mode: 'insensitive' } },
    { description: { contains: args.search, mode: 'insensitive' } },
    { location: { contains: args.search, mode: 'insensitive' } },
  ];

  const [items, total] = await Promise.all([
    prisma.event.findMany({ where, orderBy: sortOrder(args, 'date'), skip, take: limit }),
    prisma.event.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getMessages(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { userId: user.id };
  if (args.read !== undefined) where.read = args.read;
  if (args.search) where.OR = [
    { name: { contains: args.search, mode: 'insensitive' } },
    { email: { contains: args.search, mode: 'insensitive' } },
    { subject: { contains: args.search, mode: 'insensitive' } },
    { message: { contains: args.search, mode: 'insensitive' } },
  ];

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: sortOrder(args, 'createdAt'), skip, take: limit }),
    prisma.contactMessage.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

async function getNotifications(args: any) {
  const user = await prisma.user.findUnique({ where: { username: args.username } });
  if (!user) return { items: [], pageInfo: pageInfo(0, 1, 20) };

  const { page, limit, skip } = pagination(args);
  const where: any = { OR: [{ userId: user.id }, { broadcast: true }] };
  if (args.read !== undefined) where.read = args.read;
  if (args.type) where.type = args.type;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: sortOrder(args, 'createdAt'), skip, take: limit }),
    prisma.notification.count({ where }),
  ]);
  return { items, pageInfo: pageInfo(total, page, limit) };
}

// ==================== MUTATIONS ====================

async function saveHero(userId: string, input: any) {
  return prisma.heroContent.upsert({ where: { userId }, update: input, create: { userId, ...input } });
}

async function saveAbout(userId: string, input: any) {
  return prisma.aboutContent.upsert({ where: { userId }, update: input, create: { userId, ...input } });
}

async function upsertProject(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) return prisma.project.update({ where: { id }, data });
  return prisma.project.create({ data: { userId, ...data } });
}

async function upsertSkill(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) return prisma.skill.update({ where: { id }, data });
  return prisma.skill.create({ data: { userId, ...data } });
}

async function upsertExperience(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) return prisma.experience.update({ where: { id }, data });
  return prisma.experience.create({ data: { userId, ...data } });
}

async function upsertAchievement(userId: string, input: any) {
  const { id, ...data } = input;
  if (id) return prisma.achievement.update({ where: { id }, data });
  return prisma.achievement.create({ data: { userId, ...data } });
}

async function upsertEvent(userId: string, input: any) {
  const { id, ...data } = input;
  if (data.date) data.date = new Date(data.date);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (id) return prisma.event.update({ where: { id }, data });
  return prisma.event.create({ data: { userId, ...data } });
}

async function deleteById(model: string, id: string) {
  await (prisma as any)[model].delete({ where: { id } });
  return true;
}

async function markMessageRead(id: string) {
  return prisma.contactMessage.update({ where: { id }, data: { read: true } });
}

async function sendMessage(targetUsername: string, args: any) {
  const user = await prisma.user.findUnique({ where: { username: targetUsername } });
  if (!user) throw new Error('Recipient user not found');
  return prisma.contactMessage.create({
    data: { userId: user.id, name: args.name, email: args.email, subject: args.subject, message: args.message },
  });
}

async function chatWithAI(message: string, sessionId: string, history: any[]) {
  return {
    id: `msg_${Date.now()}`,
    sessionId,
    role: 'assistant',
    content: `GraphQL Lambda received: "${message}". Cloud LLM integration is ready for setup.`,
    createdAt: new Date().toISOString(),
  };
}
