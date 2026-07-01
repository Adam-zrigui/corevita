export type Role = "ADMIN" | "RADIOLOGIST" | "ASSISTANT" | "VIEWER";
export type StudyStatus = "PENDING" | "READING" | "REPORTED";

export type StudySummary = {
  id: string;
  studyUid: string;
  patientName?: string | null;
  modality?: string | null;
  slices: number;
  status: StudyStatus;
};
