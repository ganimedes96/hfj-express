"use client";
import { useState } from "react";
import { isToday } from "date-fns";
import { useGetPackages } from "@/domain/package/queries";
import { User } from "@/domain/user/types";
import { CardPackage } from "./card-package";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoaderCircle,
  LocateFixed,
  Package as PackageIcon,
  XCircle,
} from "lucide-react";
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

  // Estados da otimização
  const [isLoading, setIsLoading] = useState(false);
  const [routeBatches, setRouteBatches] = useState<Package[][] | null>(null);
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

  const handleOpenBatchRoute = (batch: Package[]) => {
    // AJUSTE: Simplificado para abrir no Google Maps com a localização atual como partida.
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const currentPos = `${latitude},${longitude}`;
      const waypoints = batch
        .map((pkg) => encodeURIComponent(`${pkg.address}, ${pkg.cep}`))
        .join("|");

      // O destino final é o último item do lote para criar uma rota mais coerente.
      const destination = batch[batch.length - 1];

      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentPos}&destination=${encodeURIComponent(
        `${destination.address}, ${destination.cep}`
      )}&waypoints=${waypoints}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    });
  };

  const handleConfirmOptimizeRoute = async () => {
    setIsConfirmDialogOpen(false);
    setIsLoading(true);
    setOrderedPackages(null);
    setRouteBatches(null);

    try {
      const userLocation = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        }
      );
      const { latitude, longitude } = userLocation.coords;
      const origin = `${latitude},${longitude}`;

      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, packages: filteredPackages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao otimizar a rota.");
      }

      const data = await response.json();
      setOrderedPackages(data.orderedPackages);
      setRouteBatches(data.routeBatches);

      // REMOVIDO: Abertura automática do mapa. O usuário agora tem os botões para fazer isso.
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // NOVO: Função para limpar a rota otimizada e voltar ao estado original.
  const handleClearOptimization = () => {
    setOrderedPackages(null);
    setRouteBatches(null);
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

      {routeBatches && (
        <Card className="my-4 bg-transparent space-3 p-2 ">
          <h3 className="text-sm font-semibold text-center text-blue-600">
            ROTA OTIMIZADA ATIVA
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {routeBatches.map((batch, index) => {
              const start = index * 9 + 1;
              const end = start + batch.length - 1;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleOpenBatchRoute(batch)}
                >
                  Parte {index + 1} ({start}-{end})
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            className="w-full text-red-500 gap-2"
            onClick={handleClearOptimization}
          >
            <XCircle className="h-4 w-4" />
            Limpar Rota
          </Button>
        </Card>
      )}
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <LoaderCircle className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-blue-600 font-semibold">
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
        packagesToShow.map((delivery, index) => (
          <CardPackage
            key={delivery.id}
            delivery={delivery}
            user={user}
            numberPackage={index + 1}
          />
        ))
      )}
    </div>
  );
}
