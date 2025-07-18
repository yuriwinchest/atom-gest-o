import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  tags: text("tags").array(),
  category: text("category"),
  author: text("author"),
  user_id: integer("user_id"), // ID do usuário que criou o documento
  createdAt: timestamp("created_at").defaultNow(),
});

// Supabase files table - compatible schema
export const files = pgTable("files", {
  id: text("id").primaryKey(), // UUID as text
  filename: text("filename").notNull(),
  original_name: text("original_name").notNull(),
  file_path: text("file_path").notNull(),
  file_size: integer("file_size").notNull(),
  mime_type: text("mime_type").notNull(),
  file_type: text("file_type").notNull(), // bucket category
  category: text("category"), // custom category
  uploaded_by: text("uploaded_by"), // user ID as text
  description: text("description"),
  tags: jsonb("tags"), // Use jsonb for arrays
  is_public: boolean("is_public").default(false),
  download_count: integer("download_count").default(0),
  last_accessed: timestamp("last_accessed"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para gerenciar conteúdo da página inicial
export const homepage_content = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // "news", "features", "hero", "footer"
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  image_url: text("image_url"), // Campo para URL da imagem
  featured: boolean("featured").default(false), // Campo para destacar card
  category: text("category"),
  author: text("author"),
  date: text("date"),
  order_index: integer("order_index").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para páginas dinâmicas do rodapé
export const footer_pages = pgTable("footer_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // URL amigável (ex: "portal-transparencia")
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(), // Conteúdo HTML/Markdown da página
  meta_description: text("meta_description"), // SEO
  icon: text("icon"), // Emoji ou nome do ícone
  category: text("category").notNull(), // "links-uteis", "contato", "redes-sociais"
  external_url: text("external_url"), // Para links externos
  is_active: boolean("is_active").default(true),
  order_index: integer("order_index").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Configurações da página inicial
export const homepage_settings = pgTable("homepage_settings", {
  id: serial("id").primaryKey(),
  cards_count: integer("cards_count").default(4),
  cards_order: text("cards_order").default("recent"), // "recent", "popular", "custom"
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para monitorar buscas e visitas no sistema
export const search_analytics = pgTable("search_analytics", {
  id: serial("id").primaryKey(),
  search_term: text("search_term"), // Termo pesquisado
  search_type: text("search_type").notNull(), // "title", "content", "tags", "category", "general"
  user_ip: text("user_ip"), // IP do usuário para analytics
  user_agent: text("user_agent"), // Navegador/dispositivo
  results_count: integer("results_count").default(0), // Quantos resultados foram encontrados
  session_id: text("session_id"), // ID da sessão
  page_url: text("page_url"), // URL da página onde foi feita a busca
  is_authenticated: boolean("is_authenticated").default(false), // Se o usuário estava logado
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para monitorar downloads e visualizações
export const document_analytics = pgTable("document_analytics", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id").references(() => documents.id),
  action_type: text("action_type").notNull(), // "view", "download", "preview"
  user_ip: text("user_ip"),
  user_agent: text("user_agent"),
  session_id: text("session_id"),
  referrer: text("referrer"), // De onde veio o usuário
  is_authenticated: boolean("is_authenticated").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  featured: boolean("featured").default(false),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  documentsCount: integer("documents_count").default(0),
  usersCount: integer("users_count").default(0),
  searchesPerMonth: integer("searches_per_month").default(0),
  totalDownloads: integer("total_downloads").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para tipos de documento dinâmicos
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").default("custom"), // "default" | "custom"
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para órgãos públicos dinâmicos
export const publicOrgans = pgTable("public_organs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para setores responsáveis dinâmicos
export const responsibleSectors = pgTable("responsible_sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para assuntos principais dinâmicos
export const mainSubjects = pgTable("main_subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para níveis de confidencialidade dinâmicos
export const confidentialityLevels = pgTable("confidentiality_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para opções de disponibilidade dinâmicas
export const availabilityOptions = pgTable("availability_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para opções de idioma dinâmicas
export const languageOptions = pgTable("language_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para opções de direitos dinâmicas
export const rightsOptions = pgTable("rights_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela para autoridades de documento dinâmicas
export const documentAuthorities = pgTable("document_authorities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Log de operações do sistema
export const operationLogs = pgTable("operation_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  document_id: integer("document_id"),
  operation: text("operation").notNull(), // view, edit, delete, share, create
  details: jsonb("details"), // informações adicionais da operação
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow(),
});

// Compartilhamentos de documentos
export const documentShares = pgTable("document_shares", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id").notNull(),
  shared_by: integer("shared_by").notNull(),
  shared_with: text("shared_with"), // email ou ID do usuário
  permission: text("permission").notNull().default("view"), // view, edit
  expires_at: timestamp("expires_at"),
  access_count: integer("access_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Links úteis do rodapé
export const footerLinks = pgTable("footer_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Redes sociais
export const socialNetworks = pgTable("social_networks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Informações de contato
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  business_hours: text("business_hours").notNull(),
  description: text("description").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para relacionamentos entre documentos
export const documentRelations = pgTable("document_relations", {
  id: serial("id").primaryKey(),
  parentDocumentId: integer("parent_document_id").notNull(),
  childDocumentId: integer("child_document_id").notNull(),
  relationType: text("relation_type").default("attached"), // attached, referenced, derived
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by"), // user ID who criou a relação
});

// Tabela para validação de formulário
export const formValidations = pgTable("form_validations", {
  id: serial("id").primaryKey(),
  field_name: text("field_name").notNull(),
  annotation: text("annotation").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela para monitoramento de logins
export const loginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"), // Pode ser null para tentativas falhadas
  username: text("username").notNull(),
  email: text("email"),
  login_status: text("login_status").notNull(), // 'success', 'failed', 'blocked'
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  session_id: text("session_id"),
  failure_reason: text("failure_reason"), // Para logins falhados
  login_time: timestamp("login_time").defaultNow(),
  logout_time: timestamp("logout_time"),
  session_duration: integer("session_duration"), // em segundos
  location_info: jsonb("location_info"), // Dados de geolocalização
  device_info: jsonb("device_info"), // Informações do dispositivo
  security_flags: jsonb("security_flags"), // Flags de segurança
});

// Tabela para sessões ativas
export const activeSessions = pgTable("active_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  session_id: text("session_id").notNull().unique(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  login_time: timestamp("login_time").defaultNow(),
  last_activity: timestamp("last_activity").defaultNow(),
  is_active: boolean("is_active").default(true),
  device_fingerprint: text("device_fingerprint"),
  location_info: jsonb("location_info"),
});

// Tabela para alertas de segurança
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  alert_type: text("alert_type").notNull(), // 'suspicious_login', 'multiple_failed_attempts', 'new_device'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  metadata: jsonb("metadata"), // Dados adicionais do alerta
  is_resolved: boolean("is_resolved").default(false),
  resolved_by: integer("resolved_by"),
  resolved_at: timestamp("resolved_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  publishedAt: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  publishedAt: true,
});

// Supabase files table schema
export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const searchDocumentsSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const insertDocumentRelationSchema = createInsertSchema(documentRelations).omit({
  id: true,
  createdAt: true,
});

// Operation logs schemas
export const insertOperationLogSchema = createInsertSchema(operationLogs).omit({
  id: true,
  created_at: true,
});

// Document shares schemas
export const insertDocumentShareSchema = createInsertSchema(documentShares).omit({
  id: true,
  created_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type SystemStats = typeof systemStats.$inferSelect;
export type SearchDocuments = z.infer<typeof searchDocumentsSchema>;

// Supabase files types
export type FileRecord = typeof files.$inferSelect;
export type InsertFileRecord = z.infer<typeof insertFileSchema>;

// Document relations types
export type DocumentRelation = typeof documentRelations.$inferSelect;
export type InsertDocumentRelation = z.infer<typeof insertDocumentRelationSchema>;

// Operation logs types
export type OperationLog = typeof operationLogs.$inferSelect;
export type InsertOperationLog = typeof operationLogs.$inferInsert;

// Document shares types
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = typeof documentShares.$inferInsert;

// Homepage content types
export const insertHomepageContentSchema = createInsertSchema(homepage_content);
export const insertHomepageSettingsSchema = createInsertSchema(homepage_settings);

// Footer pages types
export const insertFooterPageSchema = createInsertSchema(footer_pages);
export type InsertFooterPage = z.infer<typeof insertFooterPageSchema>;
export type FooterPage = typeof footer_pages.$inferSelect;

export type HomepageContent = typeof homepage_content.$inferSelect;
export type InsertHomepageContent = z.infer<typeof insertHomepageContentSchema>;
export type HomepageSettings = typeof homepage_settings.$inferSelect;
export type InsertHomepageSettings = z.infer<typeof insertHomepageSettingsSchema>;

// Footer links types
export const insertFooterLinkSchema = createInsertSchema(footerLinks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type FooterLink = typeof footerLinks.$inferSelect;
export type InsertFooterLink = z.infer<typeof insertFooterLinkSchema>;

// Social networks types
export const insertSocialNetworkSchema = createInsertSchema(socialNetworks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type SocialNetwork = typeof socialNetworks.$inferSelect;
export type InsertSocialNetwork = z.infer<typeof insertSocialNetworkSchema>;

// Contact info types
export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;

// Auth types
export type LoginData = z.infer<typeof loginSchema>;

// Form validations schemas
export const insertFormValidationSchema = createInsertSchema(formValidations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type FormValidation = typeof formValidations.$inferSelect;
export type InsertFormValidation = z.infer<typeof insertFormValidationSchema>;

// Document types schemas
export const insertDocumentTypeSchema = createInsertSchema(documentTypes).omit({
  id: true,
  created_at: true,
});

// Public organs schemas  
export const insertPublicOrganSchema = createInsertSchema(publicOrgans).omit({
  id: true,
  created_at: true,
});

// Responsible sectors schemas
export const insertResponsibleSectorSchema = createInsertSchema(responsibleSectors).omit({
  id: true,
  created_at: true,
});

// Main subjects schemas
export const insertMainSubjectSchema = createInsertSchema(mainSubjects).omit({
  id: true,
  created_at: true,
});

// Dynamic form options types
export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type PublicOrgan = typeof publicOrgans.$inferSelect;
export type InsertPublicOrgan = z.infer<typeof insertPublicOrganSchema>;
export type ResponsibleSector = typeof responsibleSectors.$inferSelect;
export type InsertResponsibleSector = z.infer<typeof insertResponsibleSectorSchema>;
export type MainSubject = typeof mainSubjects.$inferSelect;
export type InsertMainSubject = z.infer<typeof insertMainSubjectSchema>;

// Additional dynamic types schemas
export const insertConfidentialityLevelSchema = createInsertSchema(confidentialityLevels).omit({
  id: true,
  created_at: true,
});

export const insertAvailabilityOptionSchema = createInsertSchema(availabilityOptions).omit({
  id: true,
  created_at: true,
});

export const insertLanguageOptionSchema = createInsertSchema(languageOptions).omit({
  id: true,
  created_at: true,
});

export const insertRightsOptionSchema = createInsertSchema(rightsOptions).omit({
  id: true,
  created_at: true,
});

export const insertDocumentAuthoritySchema = createInsertSchema(documentAuthorities).omit({
  id: true,
  created_at: true,
});

// Login monitoring schemas
export const insertLoginLogSchema = createInsertSchema(loginLogs).omit({
  id: true,
  login_time: true,
});

export const insertActiveSessionSchema = createInsertSchema(activeSessions).omit({
  id: true,
  login_time: true,
  last_activity: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
  id: true,
  created_at: true,
});

// Additional dynamic types
export type ConfidentialityLevel = typeof confidentialityLevels.$inferSelect;
export type InsertConfidentialityLevel = z.infer<typeof insertConfidentialityLevelSchema>;
export type AvailabilityOption = typeof availabilityOptions.$inferSelect;
export type InsertAvailabilityOption = z.infer<typeof insertAvailabilityOptionSchema>;
export type LanguageOption = typeof languageOptions.$inferSelect;
export type InsertLanguageOption = z.infer<typeof insertLanguageOptionSchema>;
export type RightsOption = typeof rightsOptions.$inferSelect;
export type InsertRightsOption = z.infer<typeof insertRightsOptionSchema>;
export type DocumentAuthority = typeof documentAuthorities.$inferSelect;
export type InsertDocumentAuthority = z.infer<typeof insertDocumentAuthoritySchema>;

// Login monitoring types
export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = z.infer<typeof insertLoginLogSchema>;
export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = z.infer<typeof insertActiveSessionSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;

// Analytics schemas
export const insertSearchAnalyticsSchema = createInsertSchema(search_analytics).omit({
  id: true,
  created_at: true,
});

export const insertDocumentAnalyticsSchema = createInsertSchema(document_analytics).omit({
  id: true,
  created_at: true,
});

// Analytics types
export type SearchAnalytics = typeof search_analytics.$inferSelect;
export type InsertSearchAnalytics = z.infer<typeof insertSearchAnalyticsSchema>;
export type DocumentAnalytics = typeof document_analytics.$inferSelect;
export type InsertDocumentAnalytics = z.infer<typeof insertDocumentAnalyticsSchema>;
