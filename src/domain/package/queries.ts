import { handleServerActionResponse } from "@/api/handler";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreatePackageType, Package } from "./types";
import { CreatePackage, DeletePackage, UpdatePackage, updatePackageStatus } from "./actions";
import { getPackages } from "./client";
import { QueryKeys } from "@/lib/tanstack-query/keys";

export const useCreatePackageServer = (userId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (packageData: CreatePackageType) =>
      await CreatePackage(userId, packageData),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.packages],
        router,
      ),
  });
};


export const useUpdatePackageServer = (userId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (packageData: Package) =>
      await UpdatePackage(userId, packageData),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.packages],
        router,
      ),
  });
};



export const useDeletePackageServer = (userId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (packageId: string) =>
      await DeletePackage(userId,packageId ),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.packages],
        router,
      ),
  });
};



export const useUpdatePackageSatus = (userId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ status, id }: { status: string; id: string }) =>
      await updatePackageStatus(userId, status, id),
    onSuccess: async (response) =>
      await handleServerActionResponse(
        queryClient,
        response,
        [QueryKeys.packages],
        router,
      ),
  });
};

export function useGetPackages(userId: string) {
  return useQuery({
    queryKey: [QueryKeys.packages, userId],
    queryFn: async () => await getPackages(userId)
  });
}