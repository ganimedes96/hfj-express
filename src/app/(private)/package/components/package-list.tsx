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
import { StatusPackage } from "@/domain/package/types";
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
  const { data: packages = [] } = useGetPackages(user.id);
  const [filter, setFilter] = useState<FilterType>("today");
  console.log(packages);
  
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

   const handleConfirmOptimizeRoute = async () => {
    // 1. Fecha o Dialog para o usuário ver o app novamente
    setIsConfirmDialogOpen(false);

    // OPCIONAL: Pode mostrar um "toast" de carregamento aqui em vez de um alert
    // Por enquanto, o alert ainda é útil para dar feedback.
    alert("Iniciando otimização. Aguarde enquanto obtemos sua localização...");

    if (filteredPackages.length === 0) {
      alert("Nenhuma entrega para otimizar a rota hoje.");
      return;
    }

    try {
      const userLocation = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = userLocation.coords;
      const origin = `${latitude},${longitude}`;
      const waypoints = filteredPackages
        .map(pkg => encodeURIComponent(`${pkg.address}, ${pkg.cep}`))
        .join('|');
      const destination = origin;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      window.open(mapsUrl, "_blank");
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      alert("Não foi possível obter sua localização. Verifique se você permitiu o acesso no navegador e tente novamente.");
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
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogTrigger asChild>
            <div className="mt-4 px-1">
              <Button className="w-full text-gray-200 bg-blue-600 hover:bg-blue-700">
                <LocateFixed  className="h-4 w-4" />
                Otimizar Rotas do Dia
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Otimizar Rota de Entregas</DialogTitle>
              <DialogDescription>
                Vamos usar sua localização atual para criar a rota mais eficiente para as entregas de hoje. Você confirma?
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
