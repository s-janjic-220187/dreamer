import { PrismaClient } from '@prisma/client';
import type { 
  Dream, 
  DreamAnalysis, 
  DreamSearchParams,
  CreateDreamInput,
  UpdateDreamInput 
} from '@dreamer/shared';

const prisma = new PrismaClient();

export class DreamService {
  async createDream(data: CreateDreamInput): Promise<Dream> {
    const dream = await prisma.dream.create({
      data: {
        title: data.title,
        content: data.content,
        date: data.date || new Date(),
        tags: JSON.stringify(data.tags || []),
        mood: data.mood || 'neutral',
        audioPath: data.audioPath,
      },
      include: {
        analyses: true,
      },
    });

    return this.mapDreamFromDb(dream);
  }

  async getDreamById(id: string): Promise<Dream | null> {
    const dream = await prisma.dream.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    return dream ? this.mapDreamFromDb(dream) : null;
  }

  async updateDream(id: string, data: Partial<UpdateDreamInput>): Promise<Dream | null> {
    const existingDream = await prisma.dream.findUnique({ where: { id } });
    if (!existingDream) return null;

    const updatedDream = await prisma.dream.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.date && { date: data.date }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.mood && { mood: data.mood }),
        ...(data.audioPath !== undefined && { audioPath: data.audioPath }),
      },
      include: {
        analyses: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.mapDreamFromDb(updatedDream);
  }

  async deleteDream(id: string): Promise<boolean> {
    try {
      await prisma.dream.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async searchDreams(params: DreamSearchParams) {
    const {
      query,
      mood,
      tags,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    // Build where clause
    const where: any = {};
    
    if (mood && mood.length > 0) {
      where.mood = { in: mood };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Handle text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Handle tags filter
    if (tags && tags.length > 0) {
      // Simple contains search for tags (can be improved with proper JSON queries)
      where.tags = {
        contains: tags[0], // For simplicity, search for first tag
      };
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'date') orderBy.date = sortOrder;
    else if (sortBy === 'title') orderBy.title = sortOrder;
    else if (sortBy === 'mood') orderBy.mood = sortOrder;
    else orderBy.createdAt = sortOrder;

    // Execute query
    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          analyses: {
            orderBy: { generatedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.dream.count({ where }),
    ]);

    const mappedDreams = dreams.map(dream => this.mapDreamFromDb(dream));

    return {
      dreams: mappedDreams,
      total,
      hasMore: offset + limit < total,
    };
  }

  async analyzeDream(dreamId: string): Promise<DreamAnalysis | null> {
    const dream = await prisma.dream.findUnique({
      where: { id: dreamId },
    });

    if (!dream) return null;

    // TODO: Implement actual AI analysis here
    // For now, return a mock analysis
    const mockAnalysis = {
      interpretation: `This dream about "${dream.title}" suggests themes of ${dream.mood === 'positive' ? 'hope and positivity' : dream.mood === 'negative' ? 'challenges and growth' : 'balance and reflection'}. The dream content reveals subconscious processing of daily experiences and emotions.`,
      symbols: JSON.stringify([
        {
          symbol: 'main_theme',
          meaning: 'Central theme of the dream',
          confidence: 0.8,
          category: 'abstract',
        },
      ]),
      themes: JSON.stringify(['self-reflection', 'emotional-processing']),
      emotions: JSON.stringify([dream.mood]),
      confidence: 0.75,
      modelUsed: 'mock-analyzer-v1',
    };

    const analysis = await prisma.dreamAnalysis.create({
      data: {
        dreamId,
        ...mockAnalysis,
      },
    });

    return this.mapAnalysisFromDb(analysis);
  }

  private mapDreamFromDb(dbDream: any): Dream {
    return {
      id: dbDream.id,
      title: dbDream.title,
      content: dbDream.content,
      date: dbDream.date,
      tags: JSON.parse(dbDream.tags || '[]'),
      mood: dbDream.mood as any,
      analysis: dbDream.analyses?.[0] ? this.mapAnalysisFromDb(dbDream.analyses[0]) : undefined,
      audioPath: dbDream.audioPath,
      createdAt: dbDream.createdAt,
      updatedAt: dbDream.updatedAt,
    };
  }

  private mapAnalysisFromDb(dbAnalysis: any): DreamAnalysis {
    return {
      id: dbAnalysis.id,
      dreamId: dbAnalysis.dreamId,
      interpretation: dbAnalysis.interpretation,
      symbols: JSON.parse(dbAnalysis.symbols || '[]'),
      themes: JSON.parse(dbAnalysis.themes || '[]'),
      emotions: JSON.parse(dbAnalysis.emotions || '[]'),
      confidence: dbAnalysis.confidence,
      generatedAt: dbAnalysis.generatedAt,
      modelUsed: dbAnalysis.modelUsed,
    };
  }
}

export const dreamService = new DreamService();