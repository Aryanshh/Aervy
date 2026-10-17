import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const CAMPAIGN_OBJECTIVES = [
  "Brand Awareness",
  "Product Launch",
  "Event Promotion",
  "Wayfinding & Information",
  "Local Promotion",
  "Other",
] as const;

// Step 1: Basics Schema
export const step1BasicsSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name cannot exceed 100 characters"),
  brand: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(50, "Brand name cannot exceed 50 characters"),
  objective: z.enum(CAMPAIGN_OBJECTIVES, {
    errorMap: () => ({ message: "Please select a valid campaign objective" }),
  }),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
});

// Step 2: Creative Asset Schema
export const step2CreativeSchema = z.object({
  storageKey: z.string().min(1, "Creative asset file is required"),
  originalName: z.string().min(1, "Asset original name is required"),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: "File type must be JPG, PNG, WebP, or MP4" }),
  }),
  sizeBytes: z
    .number()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE_BYTES, "File size cannot exceed 25 MB"),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional().or(z.literal("")),
  altText: z.string().max(200, "Alt text cannot exceed 200 characters").optional().or(z.literal("")),
  ctaText: z.string().max(50, "CTA text cannot exceed 50 characters").optional().or(z.literal("")),
  destinationUrl: z
    .string()
    .url("Please enter a valid destination URL (e.g. https://yourbrand.com)")
    .optional()
    .or(z.literal("")),
});

// Step 3: Location Schema
export const step3LocationSchema = z.object({
  zoneId: z.string().min(1, "Please select an approved flight zone"),
});

// Step 4: Schedule Schema
export const step4ScheduleBaseSchema = z.object({
  startAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid start date and time",
  }),
  endAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid end date and time",
  }),
  flexibility: z.enum(["FIXED", "FLEXIBLE"]).default("FIXED"),
});

export const step4ScheduleSchema = step4ScheduleBaseSchema.refine(
  (data) => {
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["endAt"],
  }
);

// Step 5: Audience Details Schema
export const step5DetailsSchema = z.object({
  audienceNotes: z
    .string()
    .max(500, "Audience notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Operational notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

// Step 6: Review & Safety Acknowledgement Schema
export const step6ReviewSchema = z.object({
  acknowledgedSafety: z.literal(true, {
    errorMap: () => ({
      message:
        "You must acknowledge that submitting a campaign is a request for review, not a flight authorization.",
    }),
  }),
});

// Full Campaign Submission Schema
export const fullCampaignSchema = step1BasicsSchema
  .merge(step2CreativeSchema)
  .merge(step3LocationSchema)
  .merge(step4ScheduleBaseSchema)
  .merge(step5DetailsSchema)
  .merge(step6ReviewSchema)
  .refine(
    (data) => {
      const start = new Date(data.startAt).getTime();
      const end = new Date(data.endAt).getTime();
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endAt"],
    }
  );

export type Step1BasicsData = z.infer<typeof step1BasicsSchema>;
export type Step2CreativeData = z.infer<typeof step2CreativeSchema>;
export type Step3LocationData = z.infer<typeof step3LocationSchema>;
export type Step4ScheduleData = z.infer<typeof step4ScheduleSchema>;
export type Step5DetailsData = z.infer<typeof step5DetailsSchema>;
export type Step6ReviewData = z.infer<typeof step6ReviewSchema>;
export type FullCampaignData = z.infer<typeof fullCampaignSchema>;
