export interface Summary {
  id: number;
  title: string;
  originalText: string;
  customInstruction?: string;
  generatedSummary: string;
  editedSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailShareData {
  summaryId?: number;
  recipients: string[];
  subject: string;
  message: string;
  summaryContent: string;
}

export interface SummarizeRequest {
  text: string;
  customInstruction?: string;
  title?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
