"use client";
import { useState } from "react";
import { isToday } from "date-fns";
import { useGetPackages } from "@/domain/package/queries";
import { User } from "@/domain/user/types";
import { CardPackage } from "./card-package";
import { Card, CardContent } from "@/components/ui/card";
import { LocateFixed, Package as PackageIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, StatusPackage } from "@/domain/package/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Importe o DialogClose também
} from "@/components/ui/dialog";

type FilterType = "today" | StatusPackage | "all";

interface PackageListProps {
  user: User;
}

export function PackageList({ user }: PackageListProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("today");
  const { data: packages = [] } = useGetPackages(user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [orderedPackages, setOrderedPackages] = useState<Package[] | null>(
    null
  );

  const filteredPackages = packages.filter((pkg) => {
    if (filter === "all") return true;

    if (filter === "today") {
      return (
        isToday(new Date(pkg.createdAt)) &&
        (pkg.status === StatusPackage.PENDING ||
          pkg.status === StatusPackage.IN_TRANSIT)
      );
    }

    return pkg.status === filter;
  });

  const packagesToShow = orderedPackages || filteredPackages;

  const handleConfirmOptimizeRoute = async () => {
    setIsConfirmDialogOpen(false);
    setIsLoading(true);
    setOrderedPackages(null); // Limpa a ordem anterior

    try {
      const userLocation = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );
      const { latitude, longitude } = userLocation.coords;
      const origin = `${latitude},${longitude}`;

      // CHAMADA PARA A NOSSA PRÓPRIA API NEXT.JS
      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin,
          packages: filteredPackages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha ao buscar a rota otimizada."
        );
      }

      const data = await response.json();

      // ATUALIZA O ESTADO COM A LISTA ORDENADA RECEBIDA DO BACKEND
      setOrderedPackages(data.orderedPackages);

      // (Opcional) Abrir o mapa com a rota já na nova ordem
      const waypointsForUrl = data.orderedPackages
        .map((pkg: Package) => encodeURIComponent(`${pkg.address}, ${pkg.cep}`))
        .join("|");
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${waypointsForUrl}&travelmode=driving`;
      window.open(mapsUrl, "_blank");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false); // Para o indicador de carregamento
    }
  };

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
      {filter === "today" && filteredPackages.length > 0 && (
        <>
          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          >
            <DialogTrigger asChild>
              <div className="mt-4 px-1">
                <Button className="w-full text-gray-200 bg-blue-600 hover:bg-blue-700">
                  <LocateFixed className="h-4 w-4" />
                  Otimizar Rotas do Dia
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Otimizar Rota de Entregas</DialogTitle>
                <DialogDescription>
                  Vamos usar sua localização atual para criar a rota mais
                  eficiente para as entregas de hoje. Você confirma?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleConfirmOptimizeRoute}>
                  Confirmar e Iniciar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {isLoading && (
        <div className="text-center p-4">
          <p className="text-blue-600 font-semibold animate-pulse">
            Otimizando a melhor rota, aguarde...
          </p>
        </div>
      )}
      {packagesToShow.length === 0 && !isLoading ? (
        <Card className="bg-transparent mt-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Nenhuma encomenda encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        packagesToShow.map((delivery) => (
          <CardPackage key={delivery.id} delivery={delivery} user={user} />
        ))
      )}
    </div>
  );
}
