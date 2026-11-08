-- pgvector for coach retrieval (PRD 9.2). Must exist before the Embedding table.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('LEARNER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETION_PENDING');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('SIGN_UP', 'SIGN_IN', 'CHANGE_PHONE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "LangCode" AS ENUM ('EN', 'ZU', 'ST', 'TN', 'XH', 'AF');

-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConsentScope" AS ENUM ('PLATFORM', 'MATCHING', 'PARTNER_CONTACT', 'MARKETING', 'PUBLIC_PORTFOLIO', 'ACCREDITATION_SHARE');

-- CreateEnum
CREATE TYPE "ConsentActor" AS ENUM ('LEARNER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('SPONSOR', 'OPPORTUNITY_PARTNER', 'CONTENT_PARTNER', 'ACCREDITATION_PARTNER', 'SCHOOL', 'FUNDER', 'VEZA');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'MANAGER', 'VIEWER', 'ASSESSOR', 'FACILITATOR', 'TEACHER');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('INTRO', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'MODEL3D', 'AR', 'HOTSPOT_TOUR', 'PROCEDURE_SIM', 'QUIZ', 'SCENARIO', 'CALLOUT', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'CAPTIONS');

-- CreateEnum
CREATE TYPE "EnrolStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'IMAGE_HOTSPOT', 'ORDERING');

-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('PHOTO', 'PDF', 'VIDEO', 'TEXT');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'COMPETENT', 'NOT_YET_COMPETENT');

-- CreateEnum
CREATE TYPE "CredentialKind" AS ENUM ('COMPLETION', 'ACCREDITED', 'BADGE');

-- CreateEnum
CREATE TYPE "AccredStatus" AS ENUM ('ENROLLED', 'ASSESSED', 'MODERATED', 'SUBMITTED', 'RECORDED');

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('SCHOOL', 'MALL', 'CAMPUS', 'CAREER_FAIR', 'OTHER');

-- CreateEnum
CREATE TYPE "OppType" AS ENUM ('BURSARY', 'LEARNERSHIP', 'INTERNSHIP', 'YES_PLACEMENT', 'JOB_SHADOW', 'JOB', 'SHORT_COURSE', 'COMPETITION');

-- CreateEnum
CREATE TYPE "ApplyMode" AS ENUM ('IN_PLATFORM', 'EXTERNAL_LINK');

-- CreateEnum
CREATE TYPE "OppStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ELIGIBLE', 'NEAR_MISS', 'SUGGESTED', 'INVITED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "InviteResponse" AS ENUM ('ACCEPTED', 'SAVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'PLACED', 'UNSUCCESSFUL', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'LEARNER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "trustedDevice" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender",
    "provinceCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "schoolId" TEXT,
    "schoolNameFree" TEXT,
    "inSchool" BOOLEAN NOT NULL,
    "grade" INTEGER,
    "highestQualification" TEXT,
    "language" "LangCode" NOT NULL DEFAULT 'EN',
    "handle" TEXT,
    "restricted" BOOLEAN NOT NULL DEFAULT true,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "dataSaver" BOOLEAN NOT NULL DEFAULT false,
    "notifyChannels" JSONB NOT NULL,
    "quietHours" JSONB NOT NULL,
    "identityStatus" "IdentityStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "relationship" TEXT,
    "consentToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "scope" "ConsentScope" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedBy" "ConsentActor" NOT NULL,
    "textVersion" TEXT NOT NULL,
    "language" "LangCode" NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "bbbeeLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "emisNumber" TEXT,
    "name" TEXT NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "quintile" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "LearnerSubject" (
    "learnerId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,

    CONSTRAINT "LearnerSubject_pkey" PRIMARY KEY ("learnerId","subjectCode")
);

-- CreateTable
CREATE TABLE "Industry" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "whyItMatters" JSONB NOT NULL,
    "heroAssetId" TEXT,
    "color" TEXT NOT NULL,
    "sponsorOrgId" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industryCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "dayInLife" JSONB NOT NULL,
    "studyRoutes" JSONB NOT NULL,
    "subjectsRequired" TEXT[],
    "subjectsRecommended" TEXT[],
    "salaryBandNote" TEXT,
    "roleModel" JSONB,
    "heroAssetId" TEXT,
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "industryCode" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "creditBearing" BOOLEAN NOT NULL DEFAULT false,
    "accreditationPartnerId" TEXT,
    "qualificationRef" TEXT,
    "nqfLevel" INTEGER,
    "credits" INTEGER,
    "contentPartnerId" TEXT,
    "objectives" JSONB NOT NULL,
    "prerequisites" JSONB NOT NULL,
    "assessmentInfo" JSONB NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "order" INTEGER NOT NULL,
    "estMins" INTEGER NOT NULL,
    "assessmentCriteria" JSONB NOT NULL,
    "hasAr" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estMins" INTEGER NOT NULL,
    "completionRule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "BlockType" NOT NULL,
    "data" JSONB NOT NULL,
    "assetId" TEXT,
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset3D" (
    "id" TEXT NOT NULL,
    "assetKey" TEXT,
    "name" TEXT NOT NULL,
    "industryCode" TEXT,
    "glbUrl" TEXT NOT NULL,
    "glbSizeBytes" INTEGER NOT NULL,
    "glbLiteUrl" TEXT,
    "glbLiteSizeBytes" INTEGER,
    "usdzUrl" TEXT,
    "posterUrl" TEXT NOT NULL,
    "hotspots" JSONB NOT NULL,
    "explodeGroups" JSONB NOT NULL,
    "components" JSONB NOT NULL,
    "license" TEXT NOT NULL,
    "sourceNote" TEXT,
    "processingStatus" "AssetStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset3D_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "variants" JSONB,
    "captionsUrl" TEXT,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrolment" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseVersion" INTEGER NOT NULL,
    "status" "EnrolStatus" NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrolment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionProgress" (
    "learnerId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL,
    "blocksDone" TEXT[],
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionProgress_pkey" PRIMARY KEY ("learnerId","sectionId")
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "learnerId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("learnerId","topicId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "answer" JSONB NOT NULL,
    "feedback" JSONB,
    "criterionTags" TEXT[],
    "summative" BOOLEAN NOT NULL DEFAULT false,
    "industryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questionIds" TEXT[],
    "passMark" INTEGER NOT NULL DEFAULT 70,
    "maxAttempts" INTEGER,
    "summative" BOOLEAN NOT NULL DEFAULT false,
    "shuffle" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "criterionRef" TEXT NOT NULL,
    "kind" "EvidenceKind" NOT NULL,
    "fileUrl" TEXT,
    "text" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewerId" TEXT,
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "courseId" TEXT,
    "kind" "CredentialKind" NOT NULL,
    "title" TEXT NOT NULL,
    "issuerOrgId" TEXT NOT NULL,
    "partnerOrgId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "accreditationStatus" "AccredStatus",
    "statusHistory" JSONB NOT NULL,
    "obv3" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "LearnerBadge" (
    "learnerId" TEXT NOT NULL,
    "badgeCode" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerBadge_pkey" PRIMARY KEY ("learnerId","badgeCode")
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpoEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "venueType" "VenueType" NOT NULL,
    "venueName" TEXT NOT NULL,
    "schoolId" TEXT,
    "provinceCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "sponsorOrgId" TEXT,
    "unitCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskDevice" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "unitCode" TEXT,
    "headsetModel" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KioskDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpoSession" (
    "id" TEXT NOT NULL,
    "expoEventId" TEXT,
    "deviceId" TEXT NOT NULL,
    "claimCode" TEXT NOT NULL,
    "claimExpiresAt" TIMESTAMP(3) NOT NULL,
    "claimedByLearnerId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "ageBand" TEXT,
    "gradeBand" TEXT,
    "clarityPre" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VRSessionResult" (
    "id" TEXT NOT NULL,
    "expoSessionId" TEXT,
    "learnerId" TEXT,
    "worldCode" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "accuracy" INTEGER,
    "safetyErrors" INTEGER,
    "decisionScore" INTEGER,
    "rubric" JSONB NOT NULL,
    "events" JSONB,
    "completed" BOOLEAN NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VRSessionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "partnerOrgId" TEXT NOT NULL,
    "sponsorOrgId" TEXT,
    "type" "OppType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industryCodes" TEXT[],
    "provinceCodes" TEXT[],
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "eligibility" JSONB NOT NULL,
    "valueNote" TEXT,
    "stipendNote" TEXT,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "slots" INTEGER,
    "maxInvites" INTEGER,
    "applyMode" "ApplyMode" NOT NULL,
    "externalUrl" TEXT,
    "formSchema" JSONB,
    "autoInvite" BOOLEAN NOT NULL DEFAULT false,
    "status" "OppStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL,
    "reasons" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "channels" TEXT[],
    "respondedAt" TIMESTAMP(3),
    "response" "InviteResponse",
    "declineReason" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "invitationId" TEXT,
    "answers" JSONB NOT NULL,
    "attachments" JSONB NOT NULL,
    "status" "AppStatus" NOT NULL DEFAULT 'APPLIED',
    "history" JSONB NOT NULL,
    "consentToShareAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "type" "OppType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachConversation" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "language" "LangCode" NOT NULL,
    "context" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDoc" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "language" "LangCode" NOT NULL,
    "industryCode" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "chunk" TEXT NOT NULL,
    "language" "LangCode" NOT NULL,
    "meta" JSONB NOT NULL,
    "vector" vector(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestSignal" (
    "id" BIGSERIAL NOT NULL,
    "learnerHash" TEXT,
    "industryCode" TEXT NOT NULL,
    "careerId" TEXT,
    "signalType" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "ageBand" TEXT NOT NULL,
    "gradeBand" TEXT,
    "schoolQuintile" INTEGER,
    "source" TEXT NOT NULL,
    "expoEventId" TEXT,
    "sponsorOrgId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "programmeOrgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deepLink" TEXT,
    "channels" TEXT[],
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "name" TEXT NOT NULL,
    "props" JSONB NOT NULL,
    "requestId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "rules" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneE164_key" ON "User"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_sessionToken_key" ON "AuthSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "OtpChallenge_phoneE164_createdAt_idx" ON "OtpChallenge"("phoneE164", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_userId_key" ON "Learner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_handle_key" ON "Learner"("handle");

-- CreateIndex
CREATE INDEX "Learner_provinceCode_districtCode_idx" ON "Learner"("provinceCode", "districtCode");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_learnerId_key" ON "Guardian"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_consentToken_key" ON "Guardian"("consentToken");

-- CreateIndex
CREATE INDEX "Consent_learnerId_scope_createdAt_idx" ON "Consent"("learnerId", "scope", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_orgId_key" ON "Membership"("userId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "School_emisNumber_key" ON "School"("emisNumber");

-- CreateIndex
CREATE INDEX "School_provinceCode_districtCode_idx" ON "School"("provinceCode", "districtCode");

-- CreateIndex
CREATE UNIQUE INDEX "Career_slug_key" ON "Career"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_courseId_slug_key" ON "Topic"("courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Section_topicId_slug_key" ON "Section"("topicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Asset3D_assetKey_key" ON "Asset3D"("assetKey");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_learnerId_courseId_key" ON "Enrolment"("learnerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_publicId_key" ON "Credential"("publicId");

-- CreateIndex
CREATE INDEX "XpEvent_learnerId_createdAt_idx" ON "XpEvent"("learnerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExpoSession_claimCode_key" ON "ExpoSession"("claimCode");

-- CreateIndex
CREATE INDEX "VRSessionResult_worldCode_recordedAt_idx" ON "VRSessionResult"("worldCode", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_opportunityId_learnerId_key" ON "Match"("opportunityId", "learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_matchId_key" ON "Invitation"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_opportunityId_learnerId_key" ON "Application"("opportunityId", "learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_applicationId_key" ON "Placement"("applicationId");

-- CreateIndex
CREATE INDEX "Embedding_sourceType_sourceId_idx" ON "Embedding"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "InterestSignal_occurredAt_districtCode_industryCode_idx" ON "InterestSignal"("occurredAt", "districtCode", "industryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_learnerId_key" ON "Wallet"("learnerId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Event_name_occurredAt_idx" ON "Event"("name", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerSubject" ADD CONSTRAINT "LearnerSubject_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerSubject" ADD CONSTRAINT "LearnerSubject_subjectCode_fkey" FOREIGN KEY ("subjectCode") REFERENCES "Subject"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_industryCode_fkey" FOREIGN KEY ("industryCode") REFERENCES "Industry"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_industryCode_fkey" FOREIGN KEY ("industryCode") REFERENCES "Industry"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset3D"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionProgress" ADD CONSTRAINT "SectionProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionProgress" ADD CONSTRAINT "SectionProgress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerBadge" ADD CONSTRAINT "LearnerBadge_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerBadge" ADD CONSTRAINT "LearnerBadge_badgeCode_fkey" FOREIGN KEY ("badgeCode") REFERENCES "Badge"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpoSession" ADD CONSTRAINT "ExpoSession_expoEventId_fkey" FOREIGN KEY ("expoEventId") REFERENCES "ExpoEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpoSession" ADD CONSTRAINT "ExpoSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "KioskDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpoSession" ADD CONSTRAINT "ExpoSession_claimedByLearnerId_fkey" FOREIGN KEY ("claimedByLearnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VRSessionResult" ADD CONSTRAINT "VRSessionResult_expoSessionId_fkey" FOREIGN KEY ("expoSessionId") REFERENCES "ExpoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VRSessionResult" ADD CONSTRAINT "VRSessionResult_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachConversation" ADD CONSTRAINT "CoachConversation_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CoachConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
