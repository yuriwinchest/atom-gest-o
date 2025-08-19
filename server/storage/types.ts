import { type User, type InsertUser, type Document, type InsertDocument, type News, type InsertNews, type Feature, type InsertFeature, type SystemStats, type DocumentRelation, type InsertDocumentRelation, type OperationLog, type InsertOperationLog, type DocumentShare, type InsertDocumentShare, type HomepageContent, type InsertHomepageContent, type HomepageSettings, type InsertHomepageSettings, type FooterLink, type InsertFooterLink, type SocialNetwork, type InsertSocialNetwork, type ContactInfo, type InsertContactInfo, type FormValidation, type InsertFormValidation, type DocumentType, type InsertDocumentType, type PublicOrgan, type InsertPublicOrgan, type ResponsibleSector, type InsertResponsibleSector, type MainSubject, type InsertMainSubject, type ConfidentialityLevel, type InsertConfidentialityLevel, type AvailabilityOption, type InsertAvailabilityOption, type LanguageOption, type InsertLanguageOption, type RightsOption, type InsertRightsOption, type DocumentAuthority, type InsertDocumentAuthority } from "@shared/schema";

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

// Re-export types for convenience
export type {
  User, InsertUser, Document, InsertDocument, News, InsertNews, Feature, InsertFeature,
  SystemStats, DocumentRelation, InsertDocumentRelation, OperationLog, InsertOperationLog,
  DocumentShare, InsertDocumentShare, HomepageContent, InsertHomepageContent,
  HomepageSettings, InsertHomepageSettings, FooterLink, InsertFooterLink,
  SocialNetwork, InsertSocialNetwork, ContactInfo, InsertContactInfo,
  FormValidation, InsertFormValidation, DocumentType, InsertDocumentType,
  PublicOrgan, InsertPublicOrgan, ResponsibleSector, InsertResponsibleSector,
  MainSubject, InsertMainSubject, ConfidentialityLevel, InsertConfidentialityLevel,
  AvailabilityOption, InsertAvailabilityOption, LanguageOption, InsertLanguageOption,
  RightsOption, InsertRightsOption, DocumentAuthority, InsertDocumentAuthority
};
