export enum StatusPackage {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    IN_TRANSIT = "IN_TRANSIT",
    CANCELED = "CANCELED",
}


export type Package = {
    id: string;
    nameProduct: string;
    address: string;
    nameDestinary: string;
    cep?: string;
    status: StatusPackage;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
};


export type CreatePackageType = Omit<Package, "id" | "createdAt" | "updatedAt">;
export type UpdatePackageType = Omit<Package, "createdAt" | "updatedAt">;
