// src/model/user.model.ts

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export enum MaritalStatus {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED'
}

export enum ContactType {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
    TELEGRAM = 'TELEGRAM',
    LINE = 'LINE',
    OTHER = 'OTHER'
}

export enum PositionType {
    DEWAN_PENASEHAT = 'DEWAN_PENASEHAT',
    PENGURUS_HARIAN = 'PENGURUS_HARIAN',
    PEMBANTU_UMUM = 'PEMBANTU_UMUM',
    BIDANG = 'BIDANG'
}

export enum LeadershipPosition {
    KETUA_UMUM = 'KETUA_UMUM',
    KETUA_1 = 'KETUA_1',
    KETUA_2 = 'KETUA_2',
    KETUA_3 = 'KETUA_3',
    KETUA_4 = 'KETUA_4',
    KETUA_5 = 'KETUA_5',
    SEKRETARIS_UMUM = 'SEKRETARIS_UMUM',
    SEKRETARIS_1 = 'SEKRETARIS_1',
    SEKRETARIS_2 = 'SEKRETARIS_2',
    SEKRETARIS_3 = 'SEKRETARIS_3',
    SEKRETARIS_4 = 'SEKRETARIS_4',
    SEKRETARIS_5 = 'SEKRETARIS_5',
    BENDAHARA = 'BENDAHARA',
    WAKIL_BENDAHARA = 'WAKIL_BENDAHARA',
    ANGGOTA = 'ANGGOTA'
}

export enum LetterType {
    ROUTINE = 'ROUTINE',
    REFERENCE = 'REFERENCE',
    CERTIFICATE = 'CERTIFICATE',
    DECISION = 'DECISION',
    ENDORSEMENT = 'ENDORSEMENT',
    INSTRUCTION = 'INSTRUCTION',
    REQUEST_RESPONSE = 'REQUEST_RESPONSE',
    ASSIGNMENT = 'ASSIGNMENT',
    POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
    RECOMMENDATION = 'RECOMMENDATION',
    STATEMENT = 'STATEMENT',
    WARNING = 'WARNING',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    AGREEMENT = 'AGREEMENT',
    CIRCULAR = 'CIRCULAR'
}

export enum LetterStatus {
    DRAFT = 'DRAFT',
    WAITING_SECRETARY_REVIEW = 'WAITING_SECRETARY_REVIEW',
    WAITING_CHAIRMAN_SIGNATURE = 'WAITING_CHAIRMAN_SIGNATURE',
    WAITING_SECRETARY_SIGNATURE = 'WAITING_SECRETARY_SIGNATURE',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED'
}

export enum SignatureType {
    CHAIRMAN = 'CHAIRMAN',
    SECRETARY = 'SECRETARY',
    BOTH = 'BOTH',
    CHAIRMAN_ONLY = 'CHAIRMAN_ONLY'
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REVISED = 'REVISED'
}

export enum NotificationType {
    SYSTEM = 'SYSTEM',
    LETTER_APPROVAL = 'LETTER_APPROVAL',
    LETTER_SIGNATURE = 'LETTER_SIGNATURE',
    DISPOSITION = 'DISPOSITION',
    GENERAL = 'GENERAL',
    REMINDER = 'REMINDER',
    ALERT = 'ALERT'
}

export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    emailVerified: boolean;
    verificationToken?: string | null;
    verificationExpires?: Date | null;
    isActive: boolean;
    lastLogin?: Date | null;
    failedLoginAttempts: number;
    lockoutUntil?: Date | null;
    mustChangePassword: boolean;
    passwordChangedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    profile?: Profile;
    sessions?: Session[];
    passwordResetTokens?: PasswordResetToken[];
    auditLogs?: AuditLog[];
    notifications?: Notification[];
    createdLetters?: Letter[];
    letterLogs?: LetterLog[];
    approvals?: Approval[];
    signatures?: Signature[];
    dispositionsFrom?: Disposition[];
    dispositionsTo?: Disposition[];
}

export interface Profile {
    id: string;
    userId: string;
    nik?: string | null;
    fullName: string;
    gender?: Gender | null;
    birthPlace?: string | null;
    birthDate?: Date | null;
    religion?: string | null;
    maritalStatus?: MaritalStatus | null;
    profession?: string | null;
    photoUrl?: string | null;
    bio?: string | null;
    joinedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    user: User;
    address?: Address;
    contacts?: Contact[];
    educations?: Education[];
    memberships?: Member[];
    positionHistory?: PositionHistory[];
    authoredLetters?: Letter[];
    approvals?: Approval[];
    signatures?: Signature[];
    dispositionsFrom?: Disposition[];
    dispositionsTo?: Disposition[];
}

export interface Session {
    id: number;
    sessionToken: string;
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    deviceType?: string | null;
    browser?: string | null;
    os?: string | null;
    isActive: boolean;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;

    user: User;
}

export interface PasswordResetToken {
    id: number;
    token: string;
    userId: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;

    user: User;
}

export interface Address {
    id: number;
    profileId: string;
    street: string;
    village?: string | null;
    district?: string | null;
    regency?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    createdAt: Date;
    updatedAt: Date;

    profile: Profile;
}

export interface Contact {
    id: number;
    profileId: string;
    contactType: ContactType;
    value: string;
    isPrimary: boolean;
    isVerified: boolean;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;

    profile: Profile;
}

export interface Education {
    id: number;
    profileId: string;
    institution: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startYear: number;
    endYear?: number | null;
    isAlumni: boolean;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;

    profile: Profile;
}

export interface Member {
    id: string;
    profileId: string;
    structureId: string;
    position: LeadershipPosition;
    startDate: Date;
    endDate?: Date | null;
    isActive: boolean;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;

    profile: Profile;
    structure: Structure;
    positionHistory?: PositionHistory[];
}

export interface PositionHistory {
    id: number;
    profileId: string;
    memberId?: string | null;
    positionTitle: string;
    positionLevel: string;
    regionName: string;
    departmentName?: string | null;
    startDate: Date;
    endDate?: Date | null;
    isCurrent: boolean;
    notes?: string | null;
    createdAt: Date;

    profile: Profile;
    memberRecord?: Member | null;
}

export interface AuditLog {
    id: number;
    userId?: string | null;
    action: string;
    tableName: string;
    recordId: string;
    oldValues?: any | null;
    newValues?: any | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;

    user?: User | null;
}

export interface Notification {
    id: number;
    userId: string;
    title: string;
    message: string;
    notificationType: NotificationType;
    isRead: boolean;
    relatedId?: string | null;
    relatedType?: string | null;
    createdAt: Date;

    user: User;
}

export interface Letter {
    id: number;
    letterNumber?: string | null;
    letterType: LetterType;
    templateId?: number | null;
    subject: string;
    htmlContent: string;
    pdfUrl?: string | null;
    regionId: string;
    departmentId?: string | null;
    authorProfileId?: string | null;
    createdById?: string | null;
    status: LetterStatus;
    signatureType: SignatureType;
    requiresStamp: boolean;
    isConfidential: boolean;
    letterDate: Date;
    createdAt: Date;
    updatedAt: Date;

    template?: LetterTemplate | null;
    region: Region;
    department?: Department | null;
    authorProfile?: Profile | null;
    createdBy?: User | null;
    recipients?: Recipient[];
    copies?: Copy[];
    dispositions?: Disposition[];
    attachments?: Attachment[];
    approvals?: Approval[];
    signatures?: Signature[];
    stamps?: Stamp[];
    logs?: LetterLog[];
    bookEntries?: LetterBookEntry[];
}

export interface LetterTemplate {
    id: number;
    name: string;
    code: string;
    letterType: LetterType;
    description?: string | null;
    htmlContent: string;
    defaultSubject?: string | null;
    defaultCop: string;
    createdAt: Date;
    updatedAt: Date;

    letters?: Letter[];
}

export interface Structure {
    id: string;
    regionId: string;
    positionType: PositionType;
    departmentId?: string | null;
    createdAt: Date;
    updatedAt: Date;

    region: Region;
    department?: Department | null;
    members?: Member[];
}

export interface Region {
    id: string;
    name: string;
    code: string;
    levelId: string;
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;

    level: OrganizationLevel;
    parent?: Region | null;
    children?: Region[];
    structures?: Structure[];
    letters?: Letter[];
    letterBooks?: LetterBook[];
    letterSequences?: LetterNumberSequence[];
}

export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    createdAt: Date;

    structures?: Structure[];
    letters?: Letter[];
}

export interface OrganizationLevel {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    hierarchyLevel: number;
    createdAt: Date;

    regions?: Region[];
    letterBooks?: LetterBook[];
}

export interface Recipient {
    id: number;
    letterId: number;
    name: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    organization?: string | null;
    isPrimary: boolean;
    createdAt: Date;

    letter: Letter;
}

export interface Copy {
    id: number;
    letterId: number;
    name: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    organization?: string | null;
    notes?: string | null;
    createdAt: Date;

    letter: Letter;
}

export interface Disposition {
    id: number;
    letterId: number;
    fromUserId?: string | null;
    fromProfileId?: string | null;
    toUserId?: string | null;
    toProfileId?: string | null;
    notes: string;
    isCompleted: boolean;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    letter: Letter;
    fromUser?: User | null;
    fromProfile?: Profile | null;
    toUser?: User | null;
    toProfile?: Profile | null;
}

export interface Attachment {
    id: number;
    letterId: number;
    name: string;
    fileUrl: string;
    description?: string | null;
    createdAt: Date;

    letter: Letter;
}

export interface Approval {
    id: number;
    letterId: number;
    approverId: string;
    userId?: string | null;
    level: number;
    status: ApprovalStatus;
    notes?: string | null;
    approvedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    letter: Letter;
    approver: Profile;
    user?: User | null;
}

export interface Signature {
    id: number;
    letterId: number;
    signerId: string;
    userId?: string | null;
    role: LeadershipPosition;
    signatureImage?: string | null;
    digitalSignature?: string | null;
    signedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    letter: Letter;
    signer: Profile;
    user?: User | null;
}

export interface Stamp {
    id: number;
    letterId: number;
    stampImage: string;
    stampedAt: Date;
    createdAt: Date;

    letter: Letter;
}

export interface LetterLog {
    id: number;
    letterId: number;
    userId: string;
    action: string;
    details?: string | null;
    createdAt: Date;

    letter: Letter;
    user: User;
}

export interface LetterNumberSequence {
    id: number;
    regionCode: string;
    regionId?: string | null;
    letterType: LetterType;
    year: number;
    sequence: number;
    createdAt: Date;
    updatedAt: Date;

    region?: Region | null;
}

export interface LetterBook {
    id: number;
    bookNumber: string;
    startDate: Date;
    endDate?: Date | null;
    regionId: string;
    organizationLevelId?: string | null;
    isActive: boolean;
    createdAt: Date;

    region: Region;
    organizationLevel?: OrganizationLevel | null;
    entries?: LetterBookEntry[];
}

export interface LetterBookEntry {
    id: number;
    bookId: number;
    letterId: number;
    entryNumber: number;
    entryDate: Date;
    notes?: string | null;
    createdAt: Date;

    book: LetterBook;
    letter: Letter;
}