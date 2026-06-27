"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const crmExtendedApi = {
  // Deals
  getDeals: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.deals);
      return res.data.data;
    } catch {
      return [];
    }
  },
  createDeal: async (data: any) => {
    const res = await apiClient.post(endpoints.crm.deals, data);
    return res.data.data;
  },
  updateDealStage: async (id: string, stage: string) => {
    const res = await apiClient.patch(endpoints.crm.dealStage(id), { stage });
    return res.data.data;
  },
  bulkUpdateDealStage: async (dealIds: string[], stage: string) => {
    const res = await apiClient.patch(endpoints.crm.dealsBulkStage, { dealIds, stage });
    return res.data;
  },

  // CRM Tasks
  getTasks: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.tasks);
      return res.data.data;
    } catch {
      return [];
    }
  },
  createTask: async (data: any) => {
    const res = await apiClient.post(endpoints.crm.tasks, data);
    return res.data.data;
  },
  updateTaskStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(endpoints.crm.taskStatus(id), { status });
    return res.data.data;
  },

  // Dialer
  getDialerQueue: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.dialerQueue);
      return res.data.data;
    } catch {
      return [];
    }
  },
  initiateCall: async (contactId: string) => {
    const res = await apiClient.post(endpoints.crm.dialerCall, { contactId });
    return res.data;
  },
  saveCallDisposition: async (callId: string, disposition: string, notes?: string) => {
    const res = await apiClient.post(endpoints.crm.dialerDisposition(callId), { disposition, notes });
    return res.data;
  },

  // WhatsApp
  getWhatsAppThreads: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.whatsappThreads);
      return res.data.data;
    } catch {
      return [];
    }
  },
  getWhatsAppMessages: async (threadId: string) => {
    try {
      const res = await apiClient.get(endpoints.crm.whatsappMessages(threadId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  sendWhatsAppMessage: async (threadId: string, text: string) => {
    const res = await apiClient.post(endpoints.crm.whatsappMessages(threadId), { text });
    return res.data.data;
  },

  // Webhooks
  getWebhooks: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.webhooks);
      return res.data.data;
    } catch {
      return [];
    }
  },
  testWebhook: async (id: string) => {
    const res = await apiClient.post(endpoints.crm.webhookTest(id));
    return res.data;
  },

  // Duplicates & Imports
  getDuplicates: async () => {
    try {
      const res = await apiClient.get(endpoints.crm.duplicates);
      return res.data.data;
    } catch {
      return [];
    }
  },
  mergeDuplicates: async (masterId: string, duplicateIds: string[]) => {
    const res = await apiClient.post(endpoints.crm.duplicateMerge, { masterId, duplicateIds });
    return res.data;
  },
  bulkImportLeads: async (leads: any[]) => {
    const res = await apiClient.post(endpoints.crm.leadsBulkImport, { leads });
    return res.data;
  }
};
