"use client";
import { useState } from "react";
import { isToday } from "date-fns";
import { useGetPackages } from "@/domain/package/queries";
import { User } from "@/domain/user/types";
import { CardPackage } from "./card-package";
import { Card, CardContent } from "@/components/ui/card";
import { Package as PackageIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { StatusPackage } from "@/domain/package/types";

type FilterType = "today" | StatusPackage | "all";

interface PackageListProps {
  user: User;
}

export function PackageList({ user }: PackageListProps) {
  const { data: packages = [] } = useGetPackages(user.id);
  const [filter, setFilter] = useState<FilterType>("today");

  const filteredPackages = packages.filter((pkg) => {
    if (filter === "all") return true;

    if (filter === "today") {
      return (
        isToday(new Date(pkg.createdAt)) &&
        (pkg.status === StatusPackage.PENDING || pkg.status === StatusPackage.IN_TRANSIT)
      );
    }

    return pkg.status === filter;
  });

  return (
    <div>
      <ScrollArea className="w-full">
        <div className="flex gap-2 items-center justify-center mt-2">
          <Badge
            className="py-1"
            onClick={() => setFilter("today")}
            variant={filter === "today" ? "default" : "outline"}
          >
            Cadastradas hoje
          </Badge>
          <Badge
            className="py-1"
            onClick={() => setFilter(StatusPackage.CANCELED)}
            variant={filter === StatusPackage.CANCELED ? "default" : "outline"}
          >
            Canceladas
          </Badge>
          <Badge
            className="py-1"
            onClick={() => setFilter(StatusPackage.DELIVERED)}
            variant={filter === StatusPackage.DELIVERED ? "default" : "outline"}
          >
            Finalizadas
          </Badge>
          <Badge
            className="py-1"
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
          >
            Todas
          </Badge>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {filteredPackages.length === 0 ? (
        <Card className="bg-transparent mt-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Nenhuma encomenda encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredPackages.map((delivery) => (
          <CardPackage key={delivery.id} delivery={delivery} user={user} />
        ))
      )}
    </div>
  );
}
