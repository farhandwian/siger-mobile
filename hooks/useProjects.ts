import { useCallback, useState } from "react";

export interface SubActivity {
  id: string;
  name: string;
  satuan: string;
  volumeKontrak: number;
  weight: number;
  order: number;
}

export interface Activity {
  id: string;
  name: string;
  order: number;
  subActivities: SubActivity[];
}

export interface Project {
  id: string;
  pekerjaan: string;
  penyediaJasa: string;
  nilaiKontrak: string;
  tanggalKontrak: string;
  akhirKontrak: string;
  fisikProgress: number;
  fisikTarget: number;
  activities: Activity[];
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export const useProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects =
    useCallback(async (): Promise<ProjectsResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const apiBaseUrl =
          process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${apiBaseUrl}/api/full-projects`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ProjectsResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch projects");
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        console.error("Error fetching projects:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  return {
    fetchProjects,
    isLoading,
    error,
  };
};
