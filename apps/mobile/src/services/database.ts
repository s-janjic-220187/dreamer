import * as SQLite from 'expo-sqlite'
import { Dream } from '../types/Dream'

export interface DatabaseDream extends Omit<Dream, 'tags' | 'createdAt' | 'updatedAt'> {
  tags: string // JSON string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.db = await SQLite.openDatabaseAsync('dreams.db')
      await this.createTables()
      this.isInitialized = true
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error('Database initialization failed')
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const createDreamsTable = `
      CREATE TABLE IF NOT EXISTS dreams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT,
        tags TEXT, -- JSON array as string
        isLucid INTEGER DEFAULT 0, -- SQLite doesn't have boolean
        sleepQuality INTEGER,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `

    const createTagsTable = `
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        count INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL
      );
    `

    const createDreamImagesTable = `
      CREATE TABLE IF NOT EXISTS dream_images (
        id TEXT PRIMARY KEY,
        dreamId TEXT NOT NULL,
        imageUri TEXT NOT NULL,
        caption TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (dreamId) REFERENCES dreams (id) ON DELETE CASCADE
      );
    `

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams (createdAt);
      CREATE INDEX IF NOT EXISTS idx_dreams_mood ON dreams (mood);
      CREATE INDEX IF NOT EXISTS idx_dreams_lucid ON dreams (isLucid);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);
      CREATE INDEX IF NOT EXISTS idx_dream_images_dream_id ON dream_images (dreamId);
    `

    try {
      await this.db.execAsync(createDreamsTable)
      await this.db.execAsync(createTagsTable)
      await this.db.execAsync(createDreamImagesTable)
      await this.db.execAsync(createIndexes)
    } catch (error) {
      console.error('Failed to create tables:', error)
      throw new Error('Table creation failed')
    }
  }

  // Dream CRUD operations
  async createDream(dream: Omit<Dream, 'id'>): Promise<Dream> {
    await this.ensureInitialized()
    
    const id = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const tags = JSON.stringify(dream.tags)

    const insertQuery = `
      INSERT INTO dreams (id, title, content, mood, tags, isLucid, sleepQuality, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    try {
      await this.db!.runAsync(insertQuery, [
        id,
        dream.title,
        dream.content,
        dream.mood || null,
        tags,
        dream.isLucid ? 1 : 0,
        dream.sleepQuality || null,
        now,
        now
      ])

      // Update tags table
      await this.updateTagsCount(dream.tags)

      return {
        ...dream,
        id,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      }
    } catch (error) {
      console.error('Failed to create dream:', error)
      throw new Error('Failed to save dream')
    }
  }

  async getAllDreams(): Promise<Dream[]> {
    await this.ensureInitialized()

    const query = 'SELECT * FROM dreams ORDER BY createdAt DESC'

    try {
      const result = await this.db!.getAllAsync(query)
      return result.map(this.mapDatabaseDreamToDream)
    } catch (error) {
      console.error('Failed to get dreams:', error)
      throw new Error('Failed to load dreams')
    }
  }

  async getDreamById(id: string): Promise<Dream | null> {
    await this.ensureInitialized()

    const query = 'SELECT * FROM dreams WHERE id = ?'

    try {
      const result = await this.db!.getFirstAsync(query, [id])
      return result ? this.mapDatabaseDreamToDream(result) : null
    } catch (error) {
      console.error('Failed to get dream by id:', error)
      throw new Error('Failed to load dream')
    }
  }

  async updateDream(id: string, updates: Partial<Dream>): Promise<Dream> {
    await this.ensureInitialized()

    const existingDream = await this.getDreamById(id)
    if (!existingDream) {
      throw new Error('Dream not found')
    }

    const updatedAt = new Date().toISOString()
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (updates.title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(updates.title)
    }
    if (updates.content !== undefined) {
      updateFields.push('content = ?')
      updateValues.push(updates.content)
    }
    if (updates.mood !== undefined) {
      updateFields.push('mood = ?')
      updateValues.push(updates.mood)
    }
    if (updates.tags !== undefined) {
      updateFields.push('tags = ?')
      updateValues.push(JSON.stringify(updates.tags))
    }
    if (updates.isLucid !== undefined) {
      updateFields.push('isLucid = ?')
      updateValues.push(updates.isLucid ? 1 : 0)
    }
    if (updates.sleepQuality !== undefined) {
      updateFields.push('sleepQuality = ?')
      updateValues.push(updates.sleepQuality)
    }

    updateFields.push('updatedAt = ?')
    updateValues.push(updatedAt)

    const query = `UPDATE dreams SET ${updateFields.join(', ')} WHERE id = ?`
    updateValues.push(id)

    try {
      await this.db!.runAsync(query, updateValues)

      // Update tags if they changed
      if (updates.tags) {
        await this.updateTagsCount([...existingDream.tags, ...updates.tags])
      }

      return await this.getDreamById(id) as Dream
    } catch (error) {
      console.error('Failed to update dream:', error)
      throw new Error('Failed to update dream')
    }
  }

  async deleteDream(id: string): Promise<void> {
    await this.ensureInitialized()

    const dream = await this.getDreamById(id)
    if (!dream) return

    const query = 'DELETE FROM dreams WHERE id = ?'

    try {
      await this.db!.runAsync(query, [id])
      
      // Update tags count
      await this.decrementTagsCount(dream.tags)
    } catch (error) {
      console.error('Failed to delete dream:', error)
      throw new Error('Failed to delete dream')
    }
  }

  // Search functionality
  async searchDreams(searchTerm: string): Promise<Dream[]> {
    await this.ensureInitialized()

    const query = `
      SELECT * FROM dreams 
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY createdAt DESC
    `
    const searchPattern = `%${searchTerm}%`

    try {
      const result = await this.db!.getAllAsync(query, [searchPattern, searchPattern, searchPattern])
      return result.map(this.mapDatabaseDreamToDream)
    } catch (error) {
      console.error('Failed to search dreams:', error)
      throw new Error('Failed to search dreams')
    }
  }

  // Tag management
  async getAllTags(): Promise<Array<{ name: string; count: number }>> {
    await this.ensureInitialized()

    const query = 'SELECT name, count FROM tags ORDER BY count DESC, name ASC'

    try {
      const result = await this.db!.getAllAsync(query)
      return result.map(row => ({
        name: (row as any).name,
        count: (row as any).count
      }))
    } catch (error) {
      console.error('Failed to get tags:', error)
      return []
    }
  }

  private async updateTagsCount(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const now = new Date().toISOString()
      const query = `
        INSERT INTO tags (id, name, count, createdAt) 
        VALUES (?, ?, 1, ?)
        ON CONFLICT(name) DO UPDATE SET count = count + 1
      `
      const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      try {
        await this.db!.runAsync(query, [id, tag, now])
      } catch (error) {
        console.error('Failed to update tag count:', error)
      }
    }
  }

  private async decrementTagsCount(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const query = `
        UPDATE tags SET count = count - 1 WHERE name = ?
      `
      const deleteQuery = 'DELETE FROM tags WHERE name = ? AND count <= 0'
      
      try {
        await this.db!.runAsync(query, [tag])
        await this.db!.runAsync(deleteQuery, [tag])
      } catch (error) {
        console.error('Failed to decrement tag count:', error)
      }
    }
  }

  // Dream images (for camera integration)
  async addDreamImage(dreamId: string, imageUri: string, caption?: string): Promise<string> {
    await this.ensureInitialized()

    const id = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const query = `
      INSERT INTO dream_images (id, dreamId, imageUri, caption, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `

    try {
      await this.db!.runAsync(query, [id, dreamId, imageUri, caption || null, now])
      return id
    } catch (error) {
      console.error('Failed to add dream image:', error)
      throw new Error('Failed to save image')
    }
  }

  async getDreamImages(dreamId: string): Promise<Array<{ id: string; imageUri: string; caption?: string; createdAt: Date }>> {
    await this.ensureInitialized()

    const query = 'SELECT * FROM dream_images WHERE dreamId = ? ORDER BY createdAt DESC'

    try {
      const result = await this.db!.getAllAsync(query, [dreamId])
      return result.map(row => ({
        id: (row as any).id,
        imageUri: (row as any).imageUri,
        caption: (row as any).caption,
        createdAt: new Date((row as any).createdAt)
      }))
    } catch (error) {
      console.error('Failed to get dream images:', error)
      return []
    }
  }

  // Utility methods
  private mapDatabaseDreamToDream(row: any): Dream {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      mood: row.mood,
      tags: JSON.parse(row.tags || '[]'),
      isLucid: Boolean(row.isLucid),
      sleepQuality: row.sleepQuality,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  // Backup and restore
  async exportDreams(): Promise<string> {
    const dreams = await this.getAllDreams()
    const tags = await this.getAllTags()
    
    return JSON.stringify({
      dreams,
      tags,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
  }

  async importDreams(backupData: string): Promise<{ imported: number; errors: number }> {
    try {
      const data = JSON.parse(backupData)
      let imported = 0
      let errors = 0

      for (const dream of data.dreams) {
        try {
          await this.createDream({
            title: dream.title,
            content: dream.content,
            mood: dream.mood,
            tags: dream.tags,
            isLucid: dream.isLucid,
            sleepQuality: dream.sleepQuality,
            createdAt: dream.createdAt || new Date().toISOString(),
            updatedAt: dream.updatedAt || new Date().toISOString(),
          })
          imported++
        } catch (error) {
          console.error('Failed to import dream:', error)
          errors++
        }
      }

      return { imported, errors }
    } catch (error) {
      console.error('Failed to parse backup data:', error)
      throw new Error('Invalid backup data')
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()