"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const hrmExtendedApi = {
  // Dashboard
  getDashboardSummary: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.dashboardSummary(companyId));
      return res.data.data;
    } catch {
      return { headcount: 24, onLeave: 2, openRoles: 5, payrollSnapshot: { period: "Current Month", totalAmount: 1450000, status: "PROCESSING" } };
    }
  },
  getDashboardSchedule: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.dashboardSchedule(companyId));
      return res.data.data;
    } catch {
      return [{ id: "sch-1", title: "Quarterly HR Sync", startTime: new Date().toISOString(), type: "MEETING" }];
    }
  },
  getDashboardTasks: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.dashboardTasks(companyId));
      return res.data.data;
    } catch {
      return [{ id: "task-1", title: "Approve May Regularization Requests", priority: "HIGH", status: "PENDING" }];
    }
  },
  getAttendanceSnapshot: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.dashboardAttendanceSnapshot(companyId));
      return res.data.data;
    } catch {
      return { present: 18, absent: 3, onBreak: 2, totalExpected: 23 };
    }
  },

  // Recruitment
  getRecruitmentJobs: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.recruitmentJobs(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  createRecruitmentJob: async (companyId: string, data: any) => {
    const res = await apiClient.post(endpoints.hr.recruitmentJobs(companyId), data);
    return res.data.data;
  },
  getRecruitmentCandidates: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.recruitmentCandidates(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  updateCandidateStage: async (companyId: string, candidateId: string, stage: string) => {
    const res = await apiClient.patch(endpoints.hr.recruitmentCandidateStage(companyId, candidateId), { stage });
    return res.data.data;
  },

  // Grievances
  getGrievances: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.grievances(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  createGrievance: async (companyId: string, data: any) => {
    const res = await apiClient.post(endpoints.hr.grievances(companyId), data);
    return res.data.data;
  },
  updateGrievanceStatus: async (companyId: string, id: string, status: string) => {
    const res = await apiClient.patch(endpoints.hr.grievanceStatus(companyId, id), { status });
    return res.data.data;
  },

  // Assets
  getAssets: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.assets(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  assignAsset: async (companyId: string, id: string, employeeId: string) => {
    const res = await apiClient.post(endpoints.hr.assetAssign(companyId, id), { employeeId });
    return res.data.data;
  },
  returnAsset: async (companyId: string, id: string) => {
    const res = await apiClient.post(endpoints.hr.assetReturn(companyId, id));
    return res.data.data;
  },

  // Attendance & Break
  getAttendanceRegularization: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.attendanceRegularization(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  getAttendanceOnBreak: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.attendanceOnBreak(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  startBreak: async (companyId: string) => {
    const res = await apiClient.post(endpoints.hr.attendanceBreakStart(companyId));
    return res.data;
  },
  endBreak: async (companyId: string) => {
    const res = await apiClient.post(endpoints.hr.attendanceBreakEnd(companyId));
    return res.data;
  },

  // Payroll Components & Loans
  getSalaryComponents: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.salaryComponents(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  },
  getLoans: async (companyId: string) => {
    try {
      const res = await apiClient.get(endpoints.hr.loans(companyId));
      return res.data.data;
    } catch {
      return [];
    }
  }
};
