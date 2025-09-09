import { useCallback, useState } from "react";

export interface DailySubActivity {
  id: string;
  subActivityId: string;
  userId: string;
  koordinat: {
    latitude: number;
    longitude: number;
  };
  catatanKegiatan: string;
  file: {
    filename: string;
    path: string;
  }[];
  progresRealisasiPerHari: number;
  tanggalProgres: string;
  createdAt: string;
  updatedAt: string;
  subActivity: {
    id: string;
    name: string;
    satuan: string;
    volumeKontrak: number;
    weight: number;
    order: number;
    activity: {
      id: string;
      name: string;
      order: number;
      project: {
        id: string;
        pekerjaan: string;
        penyediaJasa: string;
      };
    };
  };
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DailyActivitiesResponse {
  success: boolean;
  data: DailySubActivity[];
  pagination: Pagination;
  filters: {
    projectId: string | null;
    activityId: string | null;
    subActivityId: string | null;
    userId: string | null;
    search: string | null;
    startDate: string | null;
    endDate: string | null;
    sortBy: string;
    sortOrder: string;
  };
  message?: string;
}

export interface DailyActivitiesParams {
  page?: number;
  limit?: number;
  sortBy?: "updatedAt" | "createdAt" | "tanggalProgres";
  sortOrder?: "asc" | "desc";
  search?: string;
  projectId?: string;
  activityId?: string;
  subActivityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const useDailySubActivities = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyActivities = useCallback(
    async (
      params: DailyActivitiesParams = {}
    ): Promise<DailyActivitiesResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();

        // Add parameters to search params
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
          }
        });

        const apiBaseUrl =
          process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(
          `${apiBaseUrl}/api/daily-sub-activities/list?${searchParams}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DailyActivitiesResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch daily activities");
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error fetching daily activities:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fetchDailyActivities,
    isLoading,
    error,
  };
};
