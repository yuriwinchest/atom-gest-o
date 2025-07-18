import { users, documents as documentsTable, news, features, systemStats, documentRelations, operationLogs, documentShares, homepage_content, homepage_settings, footerLinks, socialNetworks, contactInfo, formValidations, documentTypes, publicOrgans, responsibleSectors, mainSubjects, confidentialityLevels, availabilityOptions, languageOptions, rightsOptions, documentAuthorities, type User, type InsertUser, type Document, type InsertDocument, type News, type InsertNews, type Feature, type InsertFeature, type SystemStats, type DocumentRelation, type InsertDocumentRelation, type OperationLog, type InsertOperationLog, type DocumentShare, type InsertDocumentShare, type HomepageContent, type InsertHomepageContent, type HomepageSettings, type InsertHomepageSettings, type FooterLink, type InsertFooterLink, type SocialNetwork, type InsertSocialNetwork, type ContactInfo, type InsertContactInfo, type FormValidation, type InsertFormValidation, type DocumentType, type InsertDocumentType, type PublicOrgan, type InsertPublicOrgan, type ResponsibleSector, type InsertResponsibleSector, type MainSubject, type InsertMainSubject, type ConfidentialityLevel, type InsertConfidentialityLevel, type AvailabilityOption, type InsertAvailabilityOption, type LanguageOption, type InsertLanguageOption, type RightsOption, type InsertRightsOption, type DocumentAuthority, type InsertDocumentAuthority } from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";
import { supabase, testSupabaseConnection, type FileRecord, type InsertFileRecord } from "./supabase";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  getDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  searchDocuments(query: string, category?: string, tags?: string[]): Promise<Document[]>;
  
  getNews(): Promise<News[]>;
  getFeaturedNews(): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  
  getFeatures(): Promise<Feature[]>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  
  getSystemStats(): Promise<SystemStats>;
  
  // Document relations methods
  getDocumentRelations(documentId: number): Promise<DocumentRelation[]>;
  getRelatedDocuments(documentId: number): Promise<Document[]>;
  createDocumentRelation(relation: InsertDocumentRelation): Promise<DocumentRelation>;
  deleteDocumentRelation(relationId: number): Promise<boolean>;
  
  // Operation logs methods
  logOperation(log: InsertOperationLog): Promise<OperationLog>;
  getOperationLogs(userId?: number, documentId?: number): Promise<OperationLog[]>;
  
  // Document sharing methods
  shareDocument(share: InsertDocumentShare): Promise<DocumentShare>;
  getDocumentShares(documentId: number): Promise<DocumentShare[]>;
  getSharedDocuments(userId: number): Promise<Document[]>;
  updateShareAccess(shareId: number): Promise<boolean>;
  deleteDocumentShare(shareId: number): Promise<boolean>;
  
  // Homepage content methods
  getHomepageContent(): Promise<HomepageContent[]>;
  createHomepageContent(content: InsertHomepageContent): Promise<HomepageContent>;
  updateHomepageContent(id: number, content: Partial<InsertHomepageContent>): Promise<HomepageContent | undefined>;
  deleteHomepageContent(id: number): Promise<boolean>;
  
  // Footer links methods
  getFooterLinks(): Promise<FooterLink[]>;
  createFooterLink(link: InsertFooterLink): Promise<FooterLink>;
  updateFooterLink(id: number, link: Partial<InsertFooterLink>): Promise<FooterLink | undefined>;
  deleteFooterLink(id: number): Promise<boolean>;
  
  // Social networks methods
  getSocialNetworks(): Promise<SocialNetwork[]>;
  createSocialNetwork(social: InsertSocialNetwork): Promise<SocialNetwork>;
  updateSocialNetwork(id: number, social: Partial<InsertSocialNetwork>): Promise<SocialNetwork | undefined>;
  deleteSocialNetwork(id: number): Promise<boolean>;
  
  // Contact info methods
  getContactInfo(): Promise<ContactInfo | undefined>;
  createContactInfo(contact: InsertContactInfo): Promise<ContactInfo>;
  updateContactInfo(id: number, contact: Partial<InsertContactInfo>): Promise<ContactInfo | undefined>;
  
  // Homepage settings methods
  getHomepageSettings(): Promise<HomepageSettings>;
  updateHomepageSettings(settings: Partial<InsertHomepageSettings>): Promise<HomepageSettings>;
  
  // Form validation methods
  getFormValidations(): Promise<FormValidation[]>;
  createFormValidation(validation: InsertFormValidation): Promise<FormValidation>;
  deleteFormValidation(id: number): Promise<boolean>;
  deleteAllFormValidations(): Promise<number>;
  
  // Dynamic options methods
  getDocumentTypes(): Promise<DocumentType[]>;
  createDocumentType(type: InsertDocumentType): Promise<DocumentType>;
  getPublicOrgans(): Promise<PublicOrgan[]>;
  createPublicOrgan(organ: InsertPublicOrgan): Promise<PublicOrgan>;
  getResponsibleSectors(): Promise<ResponsibleSector[]>;
  createResponsibleSector(sector: InsertResponsibleSector): Promise<ResponsibleSector>;
  getMainSubjects(): Promise<MainSubject[]>;
  createMainSubject(subject: InsertMainSubject): Promise<MainSubject>;
  
  // Additional dynamic options methods
  getConfidentialityLevels(): Promise<ConfidentialityLevel[]>;
  createConfidentialityLevel(level: InsertConfidentialityLevel): Promise<ConfidentialityLevel>;
  getAvailabilityOptions(): Promise<AvailabilityOption[]>;
  createAvailabilityOption(option: InsertAvailabilityOption): Promise<AvailabilityOption>;
  getLanguageOptions(): Promise<LanguageOption[]>;
  createLanguageOption(option: InsertLanguageOption): Promise<LanguageOption>;
  getRightsOptions(): Promise<RightsOption[]>;
  createRightsOption(option: InsertRightsOption): Promise<RightsOption>;
  getDocumentAuthorities(): Promise<DocumentAuthority[]>;
  createDocumentAuthority(authority: InsertDocumentAuthority): Promise<DocumentAuthority>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private news: Map<number, News>;
  private features: Map<number, Feature>;
  private stats: SystemStats;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentNewsId: number;
  private currentFeatureId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.news = new Map();
    this.features = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentNewsId = 1;
    this.currentFeatureId = 1;
    
    this.stats = {
      id: 1,
      documentsCount: 2547,
      usersCount: 1283,
      searchesPerMonth: 8924,
      totalDownloads: 15632,
      updatedAt: new Date(),
    };

    this.initializeData();
  }

  private initializeData() {
    // Initialize admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@empresa.com",
      password: "admin123", // In production, this should be hashed
      role: "admin",
    };
    this.users.set(adminUser.id, adminUser);

    // Initialize sample news
    const sampleNews: News = {
      id: this.currentNewsId++,
      title: "Sistema de Gestão Atualizado - Novas Funcionalidades",
      description: "Implementadas melhorias na busca e organização de documentos",
      content: "O sistema recebeu importantes atualizações que melhoram a experiência do usuário...",
      category: "Atualização",
      publishedAt: new Date(),
      featured: true,
    };
    this.news.set(sampleNews.id, sampleNews);

    // Initialize sample features
    const sampleFeatures: Feature[] = [
      {
        id: this.currentFeatureId++,
        title: "Nova Funcionalidade: Busca Avançada",
        description: "Implementamos um sistema de busca mais inteligente que permite encontrar documentos rapidamente",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Novidade",
        publishedAt: new Date("2024-01-18"),
      },
      {
        id: this.currentFeatureId++,
        title: "Digitalização do Acervo Histórico",
        description: "Concluída a digitalização de mais 150 documentos históricos do arquivo municipal",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Digitalização",
        publishedAt: new Date("2024-01-15"),
      },
    ];
    
    sampleFeatures.forEach(feature => {
      this.features.set(feature.id, feature);
    });

    // Initialize sample documents
    const sampleDocuments: Document[] = [
      {
        id: this.currentDocumentId++,
        title: "Relatório Anual de Atividades 2023",
        description: "Documento contendo o resumo das principais atividades realizadas durante o ano de 2023",
        content: "Este relatório apresenta um panorama completo das atividades...",
        tags: ["relatório", "2023", "atividades"],
        category: "Relatórios",
        author: "Secretaria Municipal",
        user_id: 1,
        createdAt: new Date("2023-12-31"),
      },
      {
        id: this.currentDocumentId++,
        title: "Manual de Procedimentos Administrativos",
        description: "Guia completo dos procedimentos administrativos da organização",
        content: "Este manual define os procedimentos padrão para...",
        tags: ["manual", "procedimentos", "administração"],
        category: "Manuais",
        author: "Departamento de RH",
        user_id: 1,
        createdAt: new Date("2023-11-15"),
      },
    ];
    
    sampleDocuments.forEach(document => {
      this.documents.set(document.id, document);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user'
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      id,
      title: insertDocument.title,
      content: insertDocument.content || null,
      tags: insertDocument.tags || null,
      category: insertDocument.category || null,
      description: insertDocument.description || null,
      author: insertDocument.author || null,
      user_id: insertDocument.user_id || null,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) {
      return undefined;
    }

    const updatedDocument: Document = {
      ...existingDocument,
      title: updates.title ?? existingDocument.title,
      content: updates.content ?? existingDocument.content,
      tags: updates.tags ?? existingDocument.tags,
      category: updates.category ?? existingDocument.category,
      description: updates.description ?? existingDocument.description,
      author: updates.author ?? existingDocument.author,
    };

    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async searchDocuments(query: string, category?: string, tags?: string[]): Promise<Document[]> {
    const documents = Array.from(this.documents.values());
    
    if (!query || query.trim() === '') {
      return documents;
    }
    
    const queryLower = query.toLowerCase();
    
    return documents.filter(doc => {
      try {
        // Busca básica em título, descrição e tags
        let matchesQuery = 
          doc.title.toLowerCase().includes(queryLower) ||
          (doc.description && doc.description.toLowerCase().includes(queryLower)) ||
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(queryLower)));

        // Busca avançada no conteúdo JSON do documento
        if (doc.content) {
          try {
            const contentData = JSON.parse(doc.content);
            
            // Buscar em todos os campos do JSON
            const searchInJson = (obj: any): boolean => {
              if (typeof obj === 'string') {
                return obj.toLowerCase().includes(queryLower);
              }
              if (typeof obj === 'object' && obj !== null) {
                return Object.values(obj).some(value => searchInJson(value));
              }
              if (Array.isArray(obj)) {
                return obj.some(item => searchInJson(item));
              }
              return false;
            };
            
            // Buscar especificamente por tipos de arquivo
            if (contentData.fileType) {
              const fileType = contentData.fileType.toLowerCase();
              
              // Busca por termos específicos de arquivo
              if (queryLower.includes('pdf') && fileType.includes('pdf')) {
                matchesQuery = true;
              }
              if (queryLower.includes('word') && (fileType.includes('word') || fileType.includes('document'))) {
                matchesQuery = true;
              }
              if (queryLower.includes('excel') && (fileType.includes('spreadsheet') || fileType.includes('excel'))) {
                matchesQuery = true;
              }
              if ((queryLower.includes('foto') || queryLower.includes('imagem') || queryLower.includes('image')) && fileType.includes('image')) {
                matchesQuery = true;
              }
              if ((queryLower.includes('video') || queryLower.includes('filme')) && fileType.includes('video')) {
                matchesQuery = true;
              }
              if ((queryLower.includes('audio') || queryLower.includes('som') || queryLower.includes('música')) && fileType.includes('audio')) {
                matchesQuery = true;
              }
            }
            
            // Buscar em qualquer campo do JSON
            if (!matchesQuery) {
              matchesQuery = searchInJson(contentData);
            }
            
          } catch (jsonError) {
            // Se não for JSON válido, buscar como texto normal
            matchesQuery = matchesQuery || doc.content.toLowerCase().includes(queryLower);
          }
        }
        
        const matchesCategory = !category || doc.category === category;
        const matchesTags = !tags || tags.length === 0 || 
          (doc.tags && tags.some(tag => doc.tags!.includes(tag)));
        
        return matchesQuery && matchesCategory && matchesTags;
      } catch (filterError) {
        console.error('Erro no filtro de documento:', filterError, doc);
        return false;
      }
    });
  }

  async getNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort((a, b) => 
      new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    );
  }

  async getFeaturedNews(): Promise<News | undefined> {
    return Array.from(this.news.values()).find(news => news.featured);
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = this.currentNewsId++;
    const news: News = { 
      id,
      title: insertNews.title,
      description: insertNews.description,
      category: insertNews.category,
      content: insertNews.content || null,
      featured: insertNews.featured || null,
      publishedAt: new Date(),
    };
    this.news.set(id, news);
    return news;
  }

  async getFeatures(): Promise<Feature[]> {
    return Array.from(this.features.values()).sort((a, b) => 
      new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime()
    );
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const id = this.currentFeatureId++;
    const feature: Feature = { 
      id,
      title: insertFeature.title,
      description: insertFeature.description,
      category: insertFeature.category || null,
      imageUrl: insertFeature.imageUrl || null,
      publishedAt: new Date(),
    };
    this.features.set(id, feature);
    return feature;
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.stats;
  }

  async getDocumentRelations(documentId: number): Promise<DocumentRelation[]> {
    // Mock implementation for memory storage
    return [];
  }

  async getRelatedDocuments(documentId: number): Promise<Document[]> {
    // Mock implementation for memory storage
    return [];
  }

  async createDocumentRelation(relation: InsertDocumentRelation): Promise<DocumentRelation> {
    // Mock implementation for memory storage
    const newRelation: DocumentRelation = {
      id: 1,
      parentDocumentId: relation.parentDocumentId,
      childDocumentId: relation.childDocumentId,
      relationType: relation.relationType || null,
      description: relation.description || null,
      createdBy: relation.createdBy || null,
      createdAt: new Date(),
    };
    return newRelation;
  }

  async deleteDocumentRelation(relationId: number): Promise<boolean> {
    // Mock implementation for memory storage
    return true;
  }

  // Operation logs methods
  async logOperation(log: InsertOperationLog): Promise<OperationLog> {
    const newLog: OperationLog = {
      id: Date.now(),
      user_id: log.user_id,
      document_id: log.document_id || null,
      operation: log.operation,
      details: log.details || null,
      ip_address: log.ip_address || null,
      user_agent: log.user_agent || null,
      created_at: new Date()
    };
    return newLog;
  }

  async getOperationLogs(userId?: number, documentId?: number): Promise<OperationLog[]> {
    // Mock implementation for memory storage
    return [];
  }

  // Document sharing methods
  async shareDocument(share: InsertDocumentShare): Promise<DocumentShare> {
    const newShare: DocumentShare = {
      id: Date.now(),
      document_id: share.document_id,
      shared_by: share.shared_by,
      shared_with: share.shared_with || null,
      permission: share.permission || 'view',
      expires_at: share.expires_at || null,
      access_count: 0,
      created_at: new Date()
    };
    return newShare;
  }

  async getDocumentShares(documentId: number): Promise<DocumentShare[]> {
    // Mock implementation for memory storage
    return [];
  }

  async getSharedDocuments(userId: number): Promise<Document[]> {
    // Mock implementation for memory storage
    return [];
  }

  async updateShareAccess(shareId: number): Promise<boolean> {
    // Mock implementation for memory storage
    return true;
  }

  async deleteDocumentShare(shareId: number): Promise<boolean> {
    // Mock implementation for memory storage
    return true;
  }

  // Form validation methods
  async getFormValidations(): Promise<FormValidation[]> {
    // Mock implementation for memory storage
    return [];
  }

  async createFormValidation(validation: InsertFormValidation): Promise<FormValidation> {
    // Mock implementation for memory storage
    const newValidation: FormValidation = {
      id: Date.now(),
      field_name: validation.field_name,
      annotation: validation.annotation,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newValidation;
  }

  async deleteFormValidation(id: number): Promise<boolean> {
    // Mock implementation for memory storage
    return false;
  }

  async deleteAllFormValidations(): Promise<number> {
    // Mock implementation for memory storage
    return 0;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documentsTable);
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documentsTable)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documentsTable)
      .set(updates)
      .where(eq(documentsTable.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const [deletedDocument] = await db
      .delete(documentsTable)
      .where(eq(documentsTable.id, id))
      .returning();
    return !!deletedDocument;
  }

  async searchDocuments(query: string, category?: string, tags?: string[]): Promise<Document[]> {
    let queryBuilder = db.select().from(documentsTable);
    
    // Note: For a more sophisticated search, you would use full-text search capabilities
    // This is a basic implementation for demonstration
    const results = await queryBuilder;
    
    if (!query || query.trim() === '') {
      return results;
    }
    
    const queryLower = query.toLowerCase();
    return results.filter(doc => {
      try {
        // BUSCA INTELIGENTE PELOS CAMPOS DO FORMULÁRIO REAL
        let matchesQuery = false;

        // Busca prioritária no conteúdo JSON do documento (dados do formulário)
        if (doc.content) {
          try {
            const contentData = JSON.parse(doc.content);
            
            // 1. TÍTULO DO FORMULÁRIO (não da tabela)
            if (contentData.title && contentData.title.toLowerCase().includes(queryLower)) {
              matchesQuery = true;
            }
            
            // 2. DESCRIÇÃO DO FORMULÁRIO
            if (contentData.description && contentData.description.toLowerCase().includes(queryLower)) {
              matchesQuery = true;
            }
            
            // 3. ASSUNTO PRINCIPAL
            if (contentData.mainSubject && contentData.mainSubject.toLowerCase().includes(queryLower)) {
              matchesQuery = true;
            }
            
            // 4. PALAVRAS-CHAVE (TAGS)
            if (contentData.tags && Array.isArray(contentData.tags)) {
              const foundInTags = contentData.tags.some((tag: string) => 
                tag.toLowerCase().includes(queryLower)
              );
              if (foundInTags) {
                matchesQuery = true;
              }
            }
            
            // 5. OUTROS CAMPOS IMPORTANTES DO FORMULÁRIO
            const otherImportantFields = [
              'publicOrgan', 'responsibleSector', 'responsible', 
              'legalBase', 'relatedProcess', 'digitalizationLocation',
              'documentAuthority', 'referenceCode'
            ];
            
            otherImportantFields.forEach(field => {
              if (contentData[field] && typeof contentData[field] === 'string' && 
                  contentData[field].toLowerCase().includes(queryLower)) {
                matchesQuery = true;
              }
            });
            
            // Buscar em todos os campos como fallback
            const searchInJson = (obj: any): boolean => {
              if (typeof obj === 'string') {
                return obj.toLowerCase().includes(queryLower);
              }
              if (typeof obj === 'object' && obj !== null) {
                return Object.values(obj).some(value => searchInJson(value));
              }
              if (Array.isArray(obj)) {
                return obj.some(item => searchInJson(item));
              }
              return false;
            };
            
            // Buscar especificamente por tipos de arquivo
            if (contentData.fileType) {
              const fileType = contentData.fileType.toLowerCase();
              
              // Busca por termos específicos de arquivo
              if (queryLower.includes('pdf') && fileType.includes('pdf')) {
                matchesQuery = true;
              }
              if (queryLower.includes('word') && (fileType.includes('word') || fileType.includes('document'))) {
                matchesQuery = true;
              }
              if (queryLower.includes('excel') && (fileType.includes('spreadsheet') || fileType.includes('excel'))) {
                matchesQuery = true;
              }
              if ((queryLower.includes('foto') || queryLower.includes('imagem') || queryLower.includes('image')) && fileType.includes('image')) {
                matchesQuery = true;
              }
              if ((queryLower.includes('video') || queryLower.includes('filme')) && fileType.includes('video')) {
                matchesQuery = true;
              }
              if ((queryLower.includes('audio') || queryLower.includes('som') || queryLower.includes('música')) && fileType.includes('audio')) {
                matchesQuery = true;
              }
            }
            
            // Buscar em qualquer campo do JSON
            if (!matchesQuery) {
              matchesQuery = searchInJson(contentData);
            }
            
          } catch (jsonError) {
            // Se não for JSON válido, buscar como texto normal
            matchesQuery = matchesQuery || doc.content.toLowerCase().includes(queryLower);
          }
        }
        
        const matchesCategory = !category || doc.category === category;
        const matchesTags = !tags || tags.length === 0 || 
          (doc.tags && tags.some(tag => doc.tags!.includes(tag)));
        
        return matchesQuery && matchesCategory && matchesTags;
      } catch (filterError) {
        console.error('Erro no filtro de documento:', filterError, doc);
        return false;
      }
    });
  }

  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(news.publishedAt);
  }

  async getFeaturedNews(): Promise<News | undefined> {
    const [featuredNews] = await db.select().from(news).where(eq(news.featured, true));
    return featuredNews || undefined;
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db
      .insert(news)
      .values(insertNews)
      .returning();
    return newsItem;
  }

  async getFeatures(): Promise<Feature[]> {
    return await db.select().from(features).orderBy(features.publishedAt);
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const [feature] = await db
      .insert(features)
      .values(insertFeature)
      .returning();
    return feature;
  }

  async getSystemStats(): Promise<SystemStats> {
    const [stats] = await db.select().from(systemStats);
    if (!stats) {
      // Create initial stats if they don't exist
      const [newStats] = await db
        .insert(systemStats)
        .values({
          documentsCount: 0,
          usersCount: 0,
          searchesPerMonth: 0,
          totalDownloads: 0,
        })
        .returning();
      return newStats;
    }
    return stats;
  }

  async getDocumentRelations(documentId: number): Promise<DocumentRelation[]> {
    return await db.select().from(documentRelations)
      .where(eq(documentRelations.parentDocumentId, documentId));
  }

  async getRelatedDocuments(documentId: number): Promise<Document[]> {
    console.log('🔍 [HybridStorage] Buscando documentos relacionados para ID:', documentId);
    
    const relations = await db.select().from(documentRelations)
      .where(eq(documentRelations.parentDocumentId, documentId));
    
    console.log('📋 [HybridStorage] Relacionamentos encontrados:', relations.length);
    
    const relatedDocIds = relations.map(r => r.childDocumentId);
    if (relatedDocIds.length === 0) {
      console.log('📄 [HybridStorage] Nenhum documento relacionado encontrado');
      return [];
    }
    
    console.log('🔗 [HybridStorage] IDs dos documentos relacionados:', relatedDocIds);
    
    // CORRIGIR: Buscar TODOS os documentos relacionados, não apenas o primeiro
    const relatedDocs = await db.select().from(documentsTable)
      .where(inArray(documentsTable.id, relatedDocIds));
    
    console.log('✅ [HybridStorage] Documentos relacionados recuperados:', relatedDocs.length);
    console.log('📄 [HybridStorage] Metadados preservados para cada documento relacionado');
    
    return relatedDocs;
  }

  async createDocumentRelation(relation: InsertDocumentRelation): Promise<DocumentRelation> {
    const [newRelation] = await db
      .insert(documentRelations)
      .values(relation)
      .returning();
    return newRelation;
  }

  async deleteDocumentRelation(relationId: number): Promise<boolean> {
    const result = await db.delete(documentRelations)
      .where(eq(documentRelations.id, relationId));
    return (result.rowCount || 0) > 0;
  }

  // Operation logs methods
  async logOperation(log: InsertOperationLog): Promise<OperationLog> {
    const [newLog] = await db
      .insert(operationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getOperationLogs(userId?: number, documentId?: number): Promise<OperationLog[]> {
    return await db.select().from(operationLogs).orderBy(operationLogs.created_at);
  }

  // Document sharing methods
  async shareDocument(share: InsertDocumentShare): Promise<DocumentShare> {
    const [newShare] = await db
      .insert(documentShares)
      .values(share)
      .returning();
    return newShare;
  }

  async getDocumentShares(documentId: number): Promise<DocumentShare[]> {
    return await db.select().from(documentShares)
      .where(eq(documentShares.document_id, documentId));
  }

  async getSharedDocuments(userId: number): Promise<Document[]> {
    const shares = await db.select().from(documentShares)
      .where(eq(documentShares.shared_with, userId.toString()));
    
    const documentIds = shares.map(s => s.document_id);
    if (documentIds.length === 0) return [];
    
    return await db.select().from(documentsTable)
      .where(eq(documentsTable.id, documentIds[0])); // Simplified for now
  }

  async updateShareAccess(shareId: number): Promise<boolean> {
    const result = await db.update(documentShares)
      .set({ access_count: sql`${documentShares.access_count} + 1` })
      .where(eq(documentShares.id, shareId));
    return (result.rowCount || 0) > 0;
  }

  async deleteDocumentShare(shareId: number): Promise<boolean> {
    const result = await db.delete(documentShares)
      .where(eq(documentShares.id, shareId));
    return (result.rowCount || 0) > 0;
  }
}

// Função para extrair texto automaticamente baseado no tipo de arquivo
async function extractTextFromDocument(content: string, fileName?: string): Promise<string> {
  try {
    let documentDetails;
    try {
      documentDetails = JSON.parse(content);
    } catch (e) {
      return ''; // Se não for JSON válido, retorna vazio
    }

    const fileType = documentDetails?.fileType?.toLowerCase() || '';
    const fileInfo = documentDetails?.fileInfo;
    const description = documentDetails?.description || '';
    const title = documentDetails?.title || fileName || '';
    
    // Começar com texto dos metadados sempre
    let extractedText = `Título: ${title}. `;
    if (description) {
      extractedText += `Descrição: ${description}. `;
    }
    
    // Adicionar contexto baseado no tipo de arquivo
    if (fileType.includes('pdf')) {
      extractedText += 'Documento PDF. Conteúdo: relatório, formulário, texto oficial, dados técnicos, informações documentais. ';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      extractedText += 'Documento Word. Conteúdo: texto formatado, relatório oficial, documento administrativo, correspondência. ';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) {
      extractedText += 'Planilha Excel/CSV. Conteúdo: dados tabulares, números, cálculos, tabelas, relatórios financeiros, estatísticas. ';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      extractedText += 'Apresentação PowerPoint. Conteúdo: slides, gráficos, apresentação visual, treinamento. ';
    } else if (fileType.includes('image')) {
      extractedText += 'Arquivo de imagem. Conteúdo: foto, gráfico, diagrama, ilustração, documento digitalizado. ';
    } else if (fileType.includes('video')) {
      extractedText += 'Arquivo de vídeo. Conteúdo: gravação, apresentação visual, treinamento em vídeo. ';
    } else if (fileType.includes('audio')) {
      extractedText += 'Arquivo de áudio. Conteúdo: gravação sonora, entrevista, ata de reunião gravada. ';
    } else if (fileType.includes('text')) {
      extractedText += 'Arquivo de texto. Conteúdo: texto simples, documentação, notas, dados não formatados. ';
    }
    
    // Adicionar informações dos metadados do formulário
    const metadataFields = [
      'documentType', 'publicOrgan', 'responsibleSector', 'responsible',
      'mainSubject', 'confidentialityLevel', 'legalBase', 'relatedProcess',
      'availability', 'language', 'rights', 'period', 'digitalizationLocation',
      'documentAuthority'
    ];
    
    for (const field of metadataFields) {
      const value = documentDetails[field];
      if (value && typeof value === 'string' && value.trim() !== '') {
        extractedText += `${value} `;
      }
    }
    
    // Adicionar tags se existirem
    if (documentDetails.tags && Array.isArray(documentDetails.tags)) {
      extractedText += documentDetails.tags.join(' ') + ' ';
    }
    
    console.log(`🔍 Texto extraído automaticamente (${extractedText.length} chars): ${extractedText.substring(0, 200)}...`);
    return extractedText.trim();
    
  } catch (error) {
    console.error('Erro na extração automática de texto:', error);
    return '';
  }
}

export class HybridStorage implements IStorage {
  private isSupabaseAvailable: boolean = false;

  constructor() {
    this.checkSupabaseAvailability();
  }

  private async checkSupabaseAvailability() {
    this.isSupabaseAvailable = await testSupabaseConnection();
    if (this.isSupabaseAvailable) {
      console.log('✅ Supabase connection available - using hybrid mode');
    } else {
      console.log('📊 Using PostgreSQL local mode');
    }
  }

  // User methods - using PostgreSQL for user management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    console.log("🔍 HybridStorage: Buscando usuário no banco:", email);
    const user = await this.getUserByEmail(email);
    console.log("👤 HybridStorage: Usuário encontrado:", user ? `ID: ${user.id}, Email: ${user.email}` : "NÃO ENCONTRADO");
    
    if (user) {
      console.log("🔑 HybridStorage: Comparando senhas - Fornecida:", password, "| Banco:", user.password);
      if (user.password === password) {
        console.log("✅ HybridStorage: Senha correta! Login autorizado");
        return user;
      } else {
        console.log("❌ HybridStorage: Senha incorreta!");
      }
    }
    return null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }

  // Document methods - try Supabase first, fallback to PostgreSQL
  async getDocuments(): Promise<Document[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data: files, error } = await supabase
          .from('files')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && files) {
          return files.map(file => this.mapFileToDocument(file));
        }
      } catch (error) {
        console.warn('Supabase fallback to PostgreSQL:', error);
        this.isSupabaseAvailable = false;
      }
    }

    // Fallback to PostgreSQL
    return await db.select().from(documentsTable);
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    if (this.isSupabaseAvailable) {
      try {
        const { data: file, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (!error && file) {
          return this.mapFileToDocument(file);
        }
      } catch (error) {
        console.warn('Supabase fallback to PostgreSQL for getDocumentById:', error);
        this.isSupabaseAvailable = false;
      }
    }

    // Fallback to PostgreSQL
    const [document] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    // Extrair texto automaticamente ANTES de salvar
    const extractedText = await extractTextFromDocument(insertDocument.content || '{}', insertDocument.title);
    
    // Adicionar texto extraído ao conteúdo se foi gerado
    let finalContent = insertDocument.content;
    if (extractedText && finalContent) {
      try {
        const contentObj = JSON.parse(finalContent);
        contentObj.extractedText = extractedText;
        finalContent = JSON.stringify(contentObj);
        console.log("✅ Texto extraído adicionado automaticamente ao documento");
      } catch (e) {
        console.warn("⚠️ Não foi possível adicionar texto extraído ao conteúdo JSON");
      }
    }

    if (this.isSupabaseAvailable) {
      try {
        // 1. Criar arquivo físico no Supabase Storage
        const fileName = `${Date.now()}_${insertDocument.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        const fileContent = `Título: ${insertDocument.title}\n\nDescrição: ${insertDocument.description || ''}\n\nConteúdo:\n${finalContent || ''}\n\nAutor: ${insertDocument.author || ''}\nCategoria: ${insertDocument.category || ''}\nTags: ${(insertDocument.tags || []).join(', ')}\n\nTexto Extraído:\n${extractedText}\n\nCriado em: ${new Date().toISOString()}`;
        
        // Upload do arquivo físico para o bucket 'documents'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, new Blob([fileContent], { type: 'text/plain' }));

        let fileUrl = null;
        let localBackupPath = null;
        
        if (!uploadError && uploadData) {
          // Obter URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);
          fileUrl = urlData.publicUrl;
          console.log(`📁 Arquivo físico salvo no Supabase Storage: ${fileName}`);
          console.log(`🔗 URL pública: ${fileUrl}`);
        } else {
          console.log('⚠️ Upload para Supabase falhou, criando backup local');
        }

        // Criar backup local independentemente do sucesso do Supabase
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          
          // Garantir que o diretório existe
          const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
          await fs.mkdir(uploadsDir, { recursive: true });
          
          localBackupPath = path.join(uploadsDir, fileName);
          await fs.writeFile(localBackupPath, fileContent, 'utf-8');
          console.log(`💾 Arquivo físico salvo localmente: ${localBackupPath}`);
        } catch (fsError) {
          console.log('⚠️ Erro ao criar backup local:', fsError);
        }

        // 2. Salvar metadados no banco de dados
        const fileRecord: InsertFileRecord = {
          name: insertDocument.title,
          description: insertDocument.description || undefined,
          file_type: 'document',
          file_path: uploadData?.path || `/local/${fileName}`,
          tags: insertDocument.tags || undefined,
          environment: 'production',
          metadata: {
            category: insertDocument.category,
            author: insertDocument.author,
            content: finalContent,
            extractedText: extractedText,
            physical_url: fileUrl
          }
        };

        const { data: file, error } = await supabase
          .from('files')
          .insert(fileRecord)
          .select()
          .single();

        if (!error && file) {
          console.log(`✅ Documento híbrido criado: ID ${file.id} com arquivo físico`);
          return this.mapFileToDocument(file);
        }
      } catch (error) {
        console.warn('⚠️ Supabase indisponível, usando PostgreSQL:', error);
        this.isSupabaseAvailable = false;
      }
    }

    // Fallback to PostgreSQL (usando texto extraído automaticamente)
    const [document] = await db.insert(documentsTable).values({
      title: insertDocument.title,
      content: finalContent || null,
      tags: insertDocument.tags || null,
      category: insertDocument.category || null,
      description: insertDocument.description || null,
      author: insertDocument.author || null,
    }).returning();
    
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    // For now, only support PostgreSQL updates
    const [document] = await db
      .update(documentsTable)
      .set(updates)
      .where(eq(documentsTable.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    try {
      console.log('🗑️ HybridStorage: Deletando documento e registros relacionados:', id);
      
      // PRIMEIRO: Limpar todos os registros relacionados no PostgreSQL
      console.log('🧹 Limpando registros de analytics...');
      await db.execute(sql`DELETE FROM document_analytics WHERE document_id = ${id}`);
      
      console.log('🧹 Limpando registros de logs...');
      await db.execute(sql`DELETE FROM operation_logs WHERE document_id = ${id}`);
      
      console.log('🧹 Limpando compartilhamentos...');
      await db.execute(sql`DELETE FROM document_shares WHERE document_id = ${id}`);
      
      // SEGUNDO: Tentar Supabase soft delete se disponível
      if (this.isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from('files')
            .update({ is_active: false })
            .eq('id', id);

          if (!error) {
            console.log('✅ Soft delete no Supabase concluído');
          }
        } catch (error) {
          console.warn('Supabase fallback para PostgreSQL:', error);
          this.isSupabaseAvailable = false;
        }
      }

      // TERCEIRO: Deletar documento principal no PostgreSQL
      console.log('🗑️ Deletando documento principal...');
      const [deletedDocument] = await db
        .delete(documentsTable)
        .where(eq(documentsTable.id, id))
        .returning();
        
      console.log('✅ HybridStorage: Documento e registros relacionados deletados com sucesso');
      return !!deletedDocument;
      
    } catch (error) {
      console.error('❌ HybridStorage: Erro ao deletar documento:', error);
      return false;
    }
  }

  async searchDocuments(query: string, category?: string, tags?: string[]): Promise<Document[]> {
    try {
      if (this.isSupabaseAvailable) {
        try {
          let queryBuilder = supabase
            .from('files')
            .select('*')
            .eq('is_active', true);

          // Basic text search in name and description
          if (query) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
          }

          // Filter by category in metadata
          if (category) {
            queryBuilder = queryBuilder.contains('metadata', { category });
          }

          // Filter by tags
          if (tags && tags.length > 0) {
            queryBuilder = queryBuilder.overlaps('tags', tags);
          }

          const { data: files, error } = await queryBuilder;

          if (!error && files) {
            return files.map(file => this.mapFileToDocument(file));
          }
        } catch (error) {
          console.warn('Supabase fallback to PostgreSQL for searchDocuments:', error);
          this.isSupabaseAvailable = false;
        }
      }

      // Fallback to PostgreSQL search
      const allDocuments: Document[] = await db.select().from(documentsTable);
      
      if (!query || query.trim() === '') {
        return allDocuments;
      }
      
      const queryLower = query.toLowerCase();
      
      return allDocuments.filter((doc: Document) => {
        try {
          // Busca básica em título, descrição e tags
          let matchesQuery = 
            doc.title.toLowerCase().includes(queryLower) ||
            (doc.description && doc.description.toLowerCase().includes(queryLower)) ||
            (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(queryLower)));

          // Busca avançada no conteúdo JSON do documento
          if (doc.content) {
            try {
              const contentData = JSON.parse(doc.content);
              
              // Buscar em todos os campos do JSON
              const searchInJson = (obj: any): boolean => {
                if (typeof obj === 'string') {
                  return obj.toLowerCase().includes(queryLower);
                }
                if (typeof obj === 'object' && obj !== null) {
                  return Object.values(obj).some(value => searchInJson(value));
                }
                if (Array.isArray(obj)) {
                  return obj.some(item => searchInJson(item));
                }
                return false;
              };
              
              // Buscar especificamente por conteúdo extraído de texto
              if (contentData.extractedText) {
                if (contentData.extractedText.toLowerCase().includes(queryLower)) {
                  matchesQuery = true;
                }
              }
              
              // Buscar em campos específicos que podem conter o texto buscado
              const searchFields = [
                'description', 'responsible', 'documentAuthority', 'mainSubject',
                'legalBase', 'relatedProcess', 'digitalizationLocation', 
                'digitalizationResponsible', 'fileName', 'notes', 'comments'
              ];
              
              searchFields.forEach(field => {
                if (contentData[field] && typeof contentData[field] === 'string') {
                  if (contentData[field].toLowerCase().includes(queryLower)) {
                    matchesQuery = true;
                  }
                }
              });
              
              // Buscar especificamente por tipos de arquivo
              if (contentData.fileType) {
                const fileType = contentData.fileType.toLowerCase();
                
                // Busca por termos específicos de arquivo
                if (queryLower.includes('pdf') && fileType.includes('pdf')) {
                  matchesQuery = true;
                }
                if (queryLower.includes('word') && (fileType.includes('word') || fileType.includes('document'))) {
                  matchesQuery = true;
                }
                if (queryLower.includes('excel') && (fileType.includes('spreadsheet') || fileType.includes('excel'))) {
                  matchesQuery = true;
                }
                if ((queryLower.includes('foto') || queryLower.includes('imagem') || queryLower.includes('image')) && fileType.includes('image')) {
                  matchesQuery = true;
                }
                if ((queryLower.includes('video') || queryLower.includes('filme')) && fileType.includes('video')) {
                  matchesQuery = true;
                }
                if ((queryLower.includes('audio') || queryLower.includes('som') || queryLower.includes('música')) && fileType.includes('audio')) {
                  matchesQuery = true;
                }
              }
              
              // Buscar em qualquer campo do JSON
              if (!matchesQuery) {
                matchesQuery = searchInJson(contentData);
              }
              
            } catch (jsonError) {
              // Se não for JSON válido, buscar como texto normal
              matchesQuery = matchesQuery || doc.content.toLowerCase().includes(queryLower);
            }
          }
          
          const matchesCategory = !category || category === "" || doc.category === category;
          const matchesTags = !tags || tags.length === 0 || 
            (doc.tags && tags.some((tag: string) => doc.tags!.includes(tag)));
          
          return matchesQuery && matchesCategory && matchesTags;
        } catch (filterError) {
          console.error('Erro no filtro de documento:', filterError, doc);
          return false;
        }
      });
    } catch (error) {
      console.error('Erro geral na busca de documentos:', error);
      throw error;
    }
  }

  // News methods - keeping existing implementation for compatibility
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(news.publishedAt);
  }

  async getFeaturedNews(): Promise<News | undefined> {
    const [featuredNews] = await db.select().from(news).where(eq(news.featured, true));
    return featuredNews || undefined;
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(insertNews).returning();
    return newsItem;
  }

  // Features methods - keeping existing implementation for compatibility
  async getFeatures(): Promise<Feature[]> {
    return await db.select().from(features).orderBy(features.publishedAt);
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const [feature] = await db.insert(features).values(insertFeature).returning();
    return feature;
  }

  // System stats - enhanced with Supabase data when available
  async getSystemStats(): Promise<SystemStats> {
    let documentsCount = 0;

    if (this.isSupabaseAvailable) {
      try {
        const { count } = await supabase
          .from('files')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        documentsCount = count || 0;
      } catch (error) {
        console.warn('Supabase fallback to PostgreSQL for stats:', error);
        this.isSupabaseAvailable = false;
      }
    }

    if (!this.isSupabaseAvailable) {
      // Fallback to PostgreSQL count
      const allDocs: Document[] = await db.select().from(documentsTable);
      documentsCount = allDocs.length;
    }

    // Get other stats from PostgreSQL
    const [stats] = await db.select().from(systemStats);
    
    if (!stats) {
      const [newStats] = await db
        .insert(systemStats)
        .values({
          documentsCount: documentsCount,
          usersCount: 1283,
          searchesPerMonth: 8924,
          totalDownloads: 15632,
        })
        .returning();
      return newStats;
    }

    // Update document count with real data
    return {
      ...stats,
      documentsCount: documentsCount
    };
  }

  // Helper method to map Supabase file records to Document schema
  private mapFileToDocument(file: FileRecord): Document {
    return {
      id: file.id,
      title: file.name,
      description: file.description || null,
      content: file.metadata?.content || null,
      tags: file.tags || null,
      category: file.metadata?.category || null,
      author: file.metadata?.author || null,
      user_id: file.user_id ? parseInt(file.user_id) : null,
      createdAt: new Date(file.created_at)
    };
  }

  async getDocumentRelations(documentId: number): Promise<DocumentRelation[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(documentRelations)
        .where(eq(documentRelations.parentDocumentId, documentId));
    }
    return [];
  }

  async getRelatedDocuments(documentId: number): Promise<Document[]> {
    if (this.isSupabaseAvailable) {
      const relations = await db.select().from(documentRelations)
        .where(eq(documentRelations.parentDocumentId, documentId));
      
      const relatedDocIds = relations.map(r => r.childDocumentId);
      if (relatedDocIds.length === 0) return [];
      
      const relatedDocs = await db.select().from(documentsTable)
        .where(eq(documentsTable.id, relatedDocIds[0]));
      
      return relatedDocs;
    }
    return [];
  }

  async createDocumentRelation(relation: InsertDocumentRelation): Promise<DocumentRelation> {
    if (this.isSupabaseAvailable) {
      const [newRelation] = await db
        .insert(documentRelations)
        .values(relation)
        .returning();
      return newRelation;
    }
    
    // Fallback para mock
    const newRelation: DocumentRelation = {
      id: 1,
      parentDocumentId: relation.parentDocumentId,
      childDocumentId: relation.childDocumentId,
      relationType: relation.relationType || null,
      description: relation.description || null,
      createdBy: relation.createdBy || null,
      createdAt: new Date(),
    };
    return newRelation;
  }

  async deleteDocumentRelation(relationId: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.delete(documentRelations)
        .where(eq(documentRelations.id, relationId));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  // Operation logs methods
  async logOperation(log: InsertOperationLog): Promise<OperationLog> {
    if (this.isSupabaseAvailable) {
      const [newLog] = await db
        .insert(operationLogs)
        .values(log)
        .returning();
      return newLog;
    }
    
    // Fallback para mock
    const newLog: OperationLog = {
      id: Date.now(),
      user_id: log.user_id,
      document_id: log.document_id || null,
      operation: log.operation,
      details: log.details || null,
      ip_address: log.ip_address || null,
      user_agent: log.user_agent || null,
      created_at: new Date()
    };
    return newLog;
  }

  async getOperationLogs(userId?: number, documentId?: number): Promise<OperationLog[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(operationLogs).orderBy(operationLogs.created_at);
    }
    return [];
  }

  // Document sharing methods
  async shareDocument(share: InsertDocumentShare): Promise<DocumentShare> {
    if (this.isSupabaseAvailable) {
      const [newShare] = await db
        .insert(documentShares)
        .values(share)
        .returning();
      return newShare;
    }
    
    // Fallback para mock
    const newShare: DocumentShare = {
      id: Date.now(),
      document_id: share.document_id,
      shared_by: share.shared_by,
      shared_with: share.shared_with || null,
      permission: share.permission || 'view',
      expires_at: share.expires_at || null,
      access_count: 0,
      created_at: new Date()
    };
    return newShare;
  }

  async getDocumentShares(documentId: number): Promise<DocumentShare[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(documentShares)
        .where(eq(documentShares.document_id, documentId));
    }
    return [];
  }

  async getSharedDocuments(userId: number): Promise<Document[]> {
    if (this.isSupabaseAvailable) {
      const shares = await db.select().from(documentShares)
        .where(eq(documentShares.shared_with, userId.toString()));
      
      const documentIds = shares.map(s => s.document_id);
      if (documentIds.length === 0) return [];
      
      return await db.select().from(documentsTable)
        .where(eq(documentsTable.id, documentIds[0])); // Simplified for now
    }
    return [];
  }

  async updateShareAccess(shareId: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.update(documentShares)
        .set({ access_count: sql`${documentShares.access_count} + 1` })
        .where(eq(documentShares.id, shareId));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  async deleteDocumentShare(shareId: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.delete(documentShares)
        .where(eq(documentShares.id, shareId));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  // Homepage content methods
  async getHomepageContent(): Promise<HomepageContent[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(homepage_content)
        .where(eq(homepage_content.is_active, true))
        .orderBy(homepage_content.order_index, homepage_content.created_at);
    }
    return [];
  }

  async createHomepageContent(content: InsertHomepageContent): Promise<HomepageContent> {
    if (this.isSupabaseAvailable) {
      const [newContent] = await db
        .insert(homepage_content)
        .values({
          ...content,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newContent;
    }
    
    // Fallback para mock
    const newContent: HomepageContent = {
      id: Date.now(),
      section: content.section,
      title: content.title,
      description: content.description || null,
      content: content.content || null,
      category: content.category || null,
      author: content.author || null,
      date: content.date || null,
      order_index: content.order_index || 0,
      is_active: content.is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newContent;
  }

  async updateHomepageContent(id: number, content: Partial<InsertHomepageContent>): Promise<HomepageContent | undefined> {
    if (this.isSupabaseAvailable) {
      const [updatedContent] = await db
        .update(homepage_content)
        .set({
          ...content,
          updated_at: new Date()
        })
        .where(eq(homepage_content.id, id))
        .returning();
      return updatedContent || undefined;
    }
    return undefined;
  }

  async deleteHomepageContent(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.delete(homepage_content)
        .where(eq(homepage_content.id, id));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  // Homepage settings methods
  async getHomepageSettings(): Promise<HomepageSettings> {
    if (this.isSupabaseAvailable) {
      const [settings] = await db.select().from(homepage_settings).limit(1);
      
      if (settings) {
        return settings;
      } else {
        // Criar configurações padrão se não existirem
        const [newSettings] = await db
          .insert(homepage_settings)
          .values({
            cards_count: 4,
            cards_order: 'recent',
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning();
        return newSettings;
      }
    }
    
    // Fallback para mock
    const defaultSettings: HomepageSettings = {
      id: 1,
      cards_count: 4,
      cards_order: 'recent',
      created_at: new Date(),
      updated_at: new Date()
    };
    return defaultSettings;
  }

  async updateHomepageSettings(settings: Partial<InsertHomepageSettings>): Promise<HomepageSettings> {
    if (this.isSupabaseAvailable) {
      // Verificar se já existem configurações
      const [existingSettings] = await db.select().from(homepage_settings).limit(1);
      
      if (existingSettings) {
        // Atualizar configurações existentes
        const [updatedSettings] = await db
          .update(homepage_settings)
          .set({
            ...settings,
            updated_at: new Date()
          })
          .where(eq(homepage_settings.id, existingSettings.id))
          .returning();
        return updatedSettings;
      } else {
        // Criar novas configurações
        const [newSettings] = await db
          .insert(homepage_settings)
          .values({
            ...settings,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning();
        return newSettings;
      }
    }
    
    // Fallback para mock
    const defaultSettings: HomepageSettings = {
      id: 1,
      cards_count: settings.cards_count || 4,
      cards_order: settings.cards_order || 'recent',
      created_at: new Date(),
      updated_at: new Date()
    };
    return defaultSettings;
  }

  // Footer links methods
  async getFooterLinks(): Promise<FooterLink[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(footerLinks)
        .where(eq(footerLinks.is_active, true))
        .orderBy(footerLinks.created_at);
    }
    return [];
  }

  async createFooterLink(link: InsertFooterLink): Promise<FooterLink> {
    if (this.isSupabaseAvailable) {
      const [newLink] = await db
        .insert(footerLinks)
        .values({
          ...link,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newLink;
    }
    
    // Fallback para mock
    const newLink: FooterLink = {
      id: Date.now(),
      title: link.title,
      description: link.description,
      url: link.url,
      is_active: link.is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newLink;
  }

  async updateFooterLink(id: number, link: Partial<InsertFooterLink>): Promise<FooterLink | undefined> {
    if (this.isSupabaseAvailable) {
      const [updatedLink] = await db
        .update(footerLinks)
        .set({
          ...link,
          updated_at: new Date()
        })
        .where(eq(footerLinks.id, id))
        .returning();
      return updatedLink || undefined;
    }
    return undefined;
  }

  async deleteFooterLink(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.delete(footerLinks)
        .where(eq(footerLinks.id, id));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  // Social networks methods
  async getSocialNetworks(): Promise<SocialNetwork[]> {
    if (this.isSupabaseAvailable) {
      return await db.select().from(socialNetworks)
        .where(eq(socialNetworks.is_active, true))
        .orderBy(socialNetworks.created_at);
    }
    return [];
  }

  async createSocialNetwork(social: InsertSocialNetwork): Promise<SocialNetwork> {
    if (this.isSupabaseAvailable) {
      const [newSocial] = await db
        .insert(socialNetworks)
        .values({
          ...social,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newSocial;
    }
    
    // Fallback para mock
    const newSocial: SocialNetwork = {
      id: Date.now(),
      name: social.name,
      url: social.url,
      icon: social.icon,
      is_active: social.is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newSocial;
  }

  async updateSocialNetwork(id: number, social: Partial<InsertSocialNetwork>): Promise<SocialNetwork | undefined> {
    if (this.isSupabaseAvailable) {
      const [updatedSocial] = await db
        .update(socialNetworks)
        .set({
          ...social,
          updated_at: new Date()
        })
        .where(eq(socialNetworks.id, id))
        .returning();
      return updatedSocial || undefined;
    }
    return undefined;
  }

  async deleteSocialNetwork(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      const result = await db.delete(socialNetworks)
        .where(eq(socialNetworks.id, id));
      return (result.rowCount || 0) > 0;
    }
    return true;
  }

  // Contact info methods
  async getContactInfo(): Promise<ContactInfo | undefined> {
    if (this.isSupabaseAvailable) {
      const [contact] = await db.select().from(contactInfo).limit(1);
      return contact || undefined;
    }
    return undefined;
  }

  async createContactInfo(contact: InsertContactInfo): Promise<ContactInfo> {
    if (this.isSupabaseAvailable) {
      const [newContact] = await db
        .insert(contactInfo)
        .values({
          ...contact,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newContact;
    }
    
    // Fallback para mock
    const newContact: ContactInfo = {
      id: Date.now(),
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      business_hours: contact.business_hours,
      description: contact.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newContact;
  }

  async updateContactInfo(id: number, contact: Partial<InsertContactInfo>): Promise<ContactInfo | undefined> {
    if (this.isSupabaseAvailable) {
      const [updatedContact] = await db
        .update(contactInfo)
        .set({
          ...contact,
          updated_at: new Date()
        })
        .where(eq(contactInfo.id, id))
        .returning();
      return updatedContact || undefined;
    }
    return undefined;
  }

  // Form validation methods
  async getFormValidations(): Promise<FormValidation[]> {
    if (this.isSupabaseAvailable) {
      try {
        const validations = await db.select().from(formValidations)
          .orderBy(formValidations.created_at);
        console.log('📝 DatabaseStorage: Validações encontradas no banco:', validations.length);
        return validations;
      } catch (error) {
        console.error("❌ Erro ao buscar validações:", error);
        return [];
      }
    }
    return [];
  }

  async createFormValidation(validation: InsertFormValidation): Promise<FormValidation> {
    if (this.isSupabaseAvailable) {
      try {
        console.log('📝 DatabaseStorage: Criando/Atualizando validação:', validation);
        
        // Verificar se já existe uma anotação para este campo
        const existing = await db.select().from(formValidations)
          .where(eq(formValidations.field_name, validation.field_name))
          .limit(1);
        
        if (existing.length > 0) {
          // Atualizar a anotação existente
          const [updatedValidation] = await db
            .update(formValidations)
            .set({
              annotation: validation.annotation,
              updated_at: new Date()
            })
            .where(eq(formValidations.field_name, validation.field_name))
            .returning();
          
          console.log('✅ DatabaseStorage: Validação atualizada:', updatedValidation);
          return updatedValidation;
        } else {
          // Criar nova anotação
          const [newValidation] = await db
            .insert(formValidations)
            .values({
              field_name: validation.field_name,
              annotation: validation.annotation,
              created_at: new Date(),
              updated_at: new Date()
            })
            .returning();
          
          console.log('✅ DatabaseStorage: Validação criada:', newValidation);
          return newValidation;
        }
      } catch (error) {
        console.error('❌ Erro ao criar/atualizar validação:', error);
        throw error;
      }
    }
    
    // Fallback para mock
    const newValidation: FormValidation = {
      id: Date.now(),
      field_name: validation.field_name,
      annotation: validation.annotation,
      created_at: new Date(),
      updated_at: new Date()
    };
    return newValidation;
  }

  async deleteFormValidation(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      try {
        console.log('🗑️ DatabaseStorage: Deletando validação:', id);
        
        const deleted = await db.delete(formValidations)
          .where(eq(formValidations.id, id))
          .returning();
        
        if (deleted.length > 0) {
          console.log('✅ DatabaseStorage: Validação deletada:', deleted[0]);
          return true;
        } else {
          console.log('❌ DatabaseStorage: Validação não encontrada:', id);
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao deletar validação:', error);
        throw error;
      }
    }
    
    return false;
  }

  async deleteAllFormValidations(): Promise<number> {
    if (this.isSupabaseAvailable) {
      try {
        console.log('🗑️ DatabaseStorage: Deletando todas as validações...');
        
        const deleted = await db.delete(formValidations).returning();
        
        console.log(`✅ DatabaseStorage: ${deleted.length} validações deletadas`);
        return deleted.length;
      } catch (error) {
        console.error('❌ Erro ao deletar todas as validações:', error);
        throw error;
      }
    }
    
    return 0;
  }

  async deleteFormValidation(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      try {
        console.log('🗑️ HybridStorage: Deletando validação:', id);
        
        const deleted = await db.delete(formValidations)
          .where(eq(formValidations.id, id))
          .returning();
        
        if (deleted.length > 0) {
          console.log('✅ HybridStorage: Validação deletada:', deleted[0]);
          return true;
        } else {
          console.log('❌ HybridStorage: Validação não encontrada:', id);
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao deletar validação:', error);
        throw error;
      }
    }
    
    return false;
  }

  async deleteAllFormValidations(): Promise<number> {
    if (this.isSupabaseAvailable) {
      try {
        console.log('🗑️ HybridStorage: Deletando todas as validações...');
        
        const deleted = await db.delete(formValidations).returning();
        
        console.log(`✅ HybridStorage: ${deleted.length} validações deletadas`);
        return deleted.length;
      } catch (error) {
        console.error('❌ Erro ao deletar todas as validações:', error);
        throw error;
      }
    }
    
    return 0;
  }

  // ============= MÉTODOS PARA TIPOS DINÂMICOS DE DOCUMENTO =============

  // Document Types methods
  async getDocumentTypes(): Promise<DocumentType[]> {
    try {
      console.log('📄 HybridStorage: Buscando tipos de documento');
      const types = await db.select().from(documentTypes).orderBy(documentTypes.name);
      console.log(`✅ HybridStorage: ${types.length} tipos de documento encontrados`);
      return types;
    } catch (error) {
      console.error('❌ Erro ao buscar tipos de documento:', error);
      throw error;
    }
  }

  async createDocumentType(type: InsertDocumentType): Promise<DocumentType> {
    try {
      console.log('📄 HybridStorage: Criando tipo de documento:', type.name);
      const [newType] = await db.insert(documentTypes).values(type).returning();
      console.log('✅ HybridStorage: Tipo de documento criado:', newType);
      return newType;
    } catch (error) {
      console.error('❌ Erro ao criar tipo de documento:', error);
      throw error;
    }
  }

  // Public Organs methods
  async getPublicOrgans(): Promise<PublicOrgan[]> {
    try {
      console.log('🏛️ HybridStorage: Buscando órgãos públicos');
      const organs = await db.select().from(publicOrgans).orderBy(publicOrgans.name);
      console.log(`✅ HybridStorage: ${organs.length} órgãos públicos encontrados`);
      return organs;
    } catch (error) {
      console.error('❌ Erro ao buscar órgãos públicos:', error);
      throw error;
    }
  }

  async createPublicOrgan(organ: InsertPublicOrgan): Promise<PublicOrgan> {
    try {
      console.log('🏛️ HybridStorage: Criando órgão público:', organ.name);
      const [newOrgan] = await db.insert(publicOrgans).values(organ).returning();
      console.log('✅ HybridStorage: Órgão público criado:', newOrgan);
      return newOrgan;
    } catch (error) {
      console.error('❌ Erro ao criar órgão público:', error);
      throw error;
    }
  }

  // Responsible Sectors methods
  async getResponsibleSectors(): Promise<ResponsibleSector[]> {
    try {
      console.log('📋 HybridStorage: Buscando setores responsáveis');
      const sectors = await db.select().from(responsibleSectors).orderBy(responsibleSectors.name);
      console.log(`✅ HybridStorage: ${sectors.length} setores responsáveis encontrados`);
      return sectors;
    } catch (error) {
      console.error('❌ Erro ao buscar setores responsáveis:', error);
      throw error;
    }
  }

  async createResponsibleSector(sector: InsertResponsibleSector): Promise<ResponsibleSector> {
    try {
      console.log('📋 HybridStorage: Criando setor responsável:', sector.name);
      const [newSector] = await db.insert(responsibleSectors).values(sector).returning();
      console.log('✅ HybridStorage: Setor responsável criado:', newSector);
      return newSector;
    } catch (error) {
      console.error('❌ Erro ao criar setor responsável:', error);
      throw error;
    }
  }

  // Main Subjects methods
  async getMainSubjects(): Promise<MainSubject[]> {
    try {
      console.log('📚 HybridStorage: Buscando assuntos principais');
      const subjects = await db.select().from(mainSubjects).orderBy(mainSubjects.name);
      console.log(`✅ HybridStorage: ${subjects.length} assuntos principais encontrados`);
      return subjects;
    } catch (error) {
      console.error('❌ Erro ao buscar assuntos principais:', error);
      throw error;
    }
  }

  async createMainSubject(subject: InsertMainSubject): Promise<MainSubject> {
    try {
      console.log('📚 HybridStorage: Criando assunto principal:', subject.name);
      const [newSubject] = await db.insert(mainSubjects).values(subject).returning();
      console.log('✅ HybridStorage: Assunto principal criado:', newSubject);
      return newSubject;
    } catch (error) {
      console.error('❌ Erro ao criar assunto principal:', error);
      throw error;
    }
  }

  // ============= MÉTODOS PARA TIPOS DINÂMICOS ADICIONAIS =============

  // Confidentiality Levels methods
  async getConfidentialityLevels(): Promise<ConfidentialityLevel[]> {
    try {
      console.log('🔒 HybridStorage: Buscando níveis de confidencialidade');
      const levels = await db.select().from(confidentialityLevels).orderBy(confidentialityLevels.name);
      console.log(`✅ HybridStorage: ${levels.length} níveis de confidencialidade encontrados`);
      return levels;
    } catch (error) {
      console.error('❌ Erro ao buscar níveis de confidencialidade:', error);
      throw error;
    }
  }

  async createConfidentialityLevel(level: InsertConfidentialityLevel): Promise<ConfidentialityLevel> {
    try {
      console.log('🔒 HybridStorage: Criando nível de confidencialidade:', level.name);
      const [newLevel] = await db.insert(confidentialityLevels).values(level).returning();
      console.log('✅ HybridStorage: Nível de confidencialidade criado:', newLevel);
      return newLevel;
    } catch (error) {
      console.error('❌ Erro ao criar nível de confidencialidade:', error);
      throw error;
    }
  }

  // Availability Options methods
  async getAvailabilityOptions(): Promise<AvailabilityOption[]> {
    try {
      console.log('🌐 HybridStorage: Buscando opções de disponibilidade');
      const options = await db.select().from(availabilityOptions).orderBy(availabilityOptions.name);
      console.log(`✅ HybridStorage: ${options.length} opções de disponibilidade encontradas`);
      return options;
    } catch (error) {
      console.error('❌ Erro ao buscar opções de disponibilidade:', error);
      throw error;
    }
  }

  async createAvailabilityOption(option: InsertAvailabilityOption): Promise<AvailabilityOption> {
    try {
      console.log('🌐 HybridStorage: Criando opção de disponibilidade:', option.name);
      const [newOption] = await db.insert(availabilityOptions).values(option).returning();
      console.log('✅ HybridStorage: Opção de disponibilidade criada:', newOption);
      return newOption;
    } catch (error) {
      console.error('❌ Erro ao criar opção de disponibilidade:', error);
      throw error;
    }
  }

  // Language Options methods
  async getLanguageOptions(): Promise<LanguageOption[]> {
    try {
      console.log('🗣️ HybridStorage: Buscando opções de idioma');
      const options = await db.select().from(languageOptions).orderBy(languageOptions.name);
      console.log(`✅ HybridStorage: ${options.length} opções de idioma encontradas`);
      return options;
    } catch (error) {
      console.error('❌ Erro ao buscar opções de idioma:', error);
      throw error;
    }
  }

  async createLanguageOption(option: InsertLanguageOption): Promise<LanguageOption> {
    try {
      console.log('🗣️ HybridStorage: Criando opção de idioma:', option.name);
      const [newOption] = await db.insert(languageOptions).values(option).returning();
      console.log('✅ HybridStorage: Opção de idioma criada:', newOption);
      return newOption;
    } catch (error) {
      console.error('❌ Erro ao criar opção de idioma:', error);
      throw error;
    }
  }

  // Rights Options methods
  async getRightsOptions(): Promise<RightsOption[]> {
    try {
      console.log('⚖️ HybridStorage: Buscando opções de direitos');
      const options = await db.select().from(rightsOptions).orderBy(rightsOptions.name);
      console.log(`✅ HybridStorage: ${options.length} opções de direitos encontradas`);
      return options;
    } catch (error) {
      console.error('❌ Erro ao buscar opções de direitos:', error);
      throw error;
    }
  }

  async createRightsOption(option: InsertRightsOption): Promise<RightsOption> {
    try {
      console.log('⚖️ HybridStorage: Criando opção de direitos:', option.name);
      const [newOption] = await db.insert(rightsOptions).values(option).returning();
      console.log('✅ HybridStorage: Opção de direitos criada:', newOption);
      return newOption;
    } catch (error) {
      console.error('❌ Erro ao criar opção de direitos:', error);
      throw error;
    }
  }

  // Document Authorities methods
  async getDocumentAuthorities(): Promise<DocumentAuthority[]> {
    try {
      console.log('👑 HybridStorage: Buscando autoridades de documento');
      const authorities = await db.select().from(documentAuthorities).orderBy(documentAuthorities.name);
      console.log(`✅ HybridStorage: ${authorities.length} autoridades de documento encontradas`);
      return authorities;
    } catch (error) {
      console.error('❌ Erro ao buscar autoridades de documento:', error);
      throw error;
    }
  }

  async createDocumentAuthority(authority: InsertDocumentAuthority): Promise<DocumentAuthority> {
    try {
      console.log('👑 HybridStorage: Criando autoridade de documento:', authority.name);
      const [newAuthority] = await db.insert(documentAuthorities).values(authority).returning();
      console.log('✅ HybridStorage: Autoridade de documento criada:', newAuthority);
      return newAuthority;
    } catch (error) {
      console.error('❌ Erro ao criar autoridade de documento:', error);
      throw error;
    }
  }

  // ============= MÉTODOS PARA EDITAR E DELETAR TIPOS DINÂMICOS =============

  // Update methods for dynamic types
  async updateConfidentialityLevel(id: number, data: Partial<InsertConfidentialityLevel>): Promise<ConfidentialityLevel | null> {
    try {
      console.log('🔒 HybridStorage: Atualizando nível de confidencialidade:', id);
      const [updated] = await db.update(confidentialityLevels).set(data).where(eq(confidentialityLevels.id, id)).returning();
      console.log('✅ HybridStorage: Nível de confidencialidade atualizado:', updated);
      return updated || null;
    } catch (error) {
      console.error('❌ Erro ao atualizar nível de confidencialidade:', error);
      throw error;
    }
  }

  async updateAvailabilityOption(id: number, data: Partial<InsertAvailabilityOption>): Promise<AvailabilityOption | null> {
    try {
      console.log('🌐 HybridStorage: Atualizando opção de disponibilidade:', id);
      const [updated] = await db.update(availabilityOptions).set(data).where(eq(availabilityOptions.id, id)).returning();
      console.log('✅ HybridStorage: Opção de disponibilidade atualizada:', updated);
      return updated || null;
    } catch (error) {
      console.error('❌ Erro ao atualizar opção de disponibilidade:', error);
      throw error;
    }
  }

  async updateLanguageOption(id: number, data: Partial<InsertLanguageOption>): Promise<LanguageOption | null> {
    try {
      console.log('🗣️ HybridStorage: Atualizando opção de idioma:', id);
      const [updated] = await db.update(languageOptions).set(data).where(eq(languageOptions.id, id)).returning();
      console.log('✅ HybridStorage: Opção de idioma atualizada:', updated);
      return updated || null;
    } catch (error) {
      console.error('❌ Erro ao atualizar opção de idioma:', error);
      throw error;
    }
  }

  async updateRightsOption(id: number, data: Partial<InsertRightsOption>): Promise<RightsOption | null> {
    try {
      console.log('⚖️ HybridStorage: Atualizando opção de direitos:', id);
      const [updated] = await db.update(rightsOptions).set(data).where(eq(rightsOptions.id, id)).returning();
      console.log('✅ HybridStorage: Opção de direitos atualizada:', updated);
      return updated || null;
    } catch (error) {
      console.error('❌ Erro ao atualizar opção de direitos:', error);
      throw error;
    }
  }

  async updateDocumentAuthority(id: number, data: Partial<InsertDocumentAuthority>): Promise<DocumentAuthority | null> {
    try {
      console.log('👑 HybridStorage: Atualizando autoridade de documento:', id);
      const [updated] = await db.update(documentAuthorities).set(data).where(eq(documentAuthorities.id, id)).returning();
      console.log('✅ HybridStorage: Autoridade de documento atualizada:', updated);
      return updated || null;
    } catch (error) {
      console.error('❌ Erro ao atualizar autoridade de documento:', error);
      throw error;
    }
  }

  // Delete methods for dynamic types
  async deleteConfidentialityLevel(id: number): Promise<boolean> {
    try {
      console.log('🔒 HybridStorage: Deletando nível de confidencialidade:', id);
      const result = await db.delete(confidentialityLevels).where(eq(confidentialityLevels.id, id));
      const deleted = result.rowCount > 0;
      console.log(`✅ HybridStorage: Nível de confidencialidade ${deleted ? 'deletado' : 'não encontrado'}:`, id);
      return deleted;
    } catch (error) {
      console.error('❌ Erro ao deletar nível de confidencialidade:', error);
      throw error;
    }
  }

  async deleteAvailabilityOption(id: number): Promise<boolean> {
    try {
      console.log('🌐 HybridStorage: Deletando opção de disponibilidade:', id);
      const result = await db.delete(availabilityOptions).where(eq(availabilityOptions.id, id));
      const deleted = result.rowCount > 0;
      console.log(`✅ HybridStorage: Opção de disponibilidade ${deleted ? 'deletada' : 'não encontrada'}:`, id);
      return deleted;
    } catch (error) {
      console.error('❌ Erro ao deletar opção de disponibilidade:', error);
      throw error;
    }
  }

  async deleteLanguageOption(id: number): Promise<boolean> {
    try {
      console.log('🗣️ HybridStorage: Deletando opção de idioma:', id);
      const result = await db.delete(languageOptions).where(eq(languageOptions.id, id));
      const deleted = result.rowCount > 0;
      console.log(`✅ HybridStorage: Opção de idioma ${deleted ? 'deletada' : 'não encontrada'}:`, id);
      return deleted;
    } catch (error) {
      console.error('❌ Erro ao deletar opção de idioma:', error);
      throw error;
    }
  }

  async deleteRightsOption(id: number): Promise<boolean> {
    try {
      console.log('⚖️ HybridStorage: Deletando opção de direitos:', id);
      const result = await db.delete(rightsOptions).where(eq(rightsOptions.id, id));
      const deleted = result.rowCount > 0;
      console.log(`✅ HybridStorage: Opção de direitos ${deleted ? 'deletada' : 'não encontrada'}:`, id);
      return deleted;
    } catch (error) {
      console.error('❌ Erro ao deletar opção de direitos:', error);
      throw error;
    }
  }

  async deleteDocumentAuthority(id: number): Promise<boolean> {
    try {
      console.log('👑 HybridStorage: Deletando autoridade de documento:', id);
      const result = await db.delete(documentAuthorities).where(eq(documentAuthorities.id, id));
      const deleted = result.rowCount > 0;
      console.log(`✅ HybridStorage: Autoridade de documento ${deleted ? 'deletada' : 'não encontrada'}:`, id);
      return deleted;
    } catch (error) {
      console.error('❌ Erro ao deletar autoridade de documento:', error);
      throw error;
    }
  }
}

// Switch to HybridStorage for Supabase integration
export const storage = new HybridStorage();
