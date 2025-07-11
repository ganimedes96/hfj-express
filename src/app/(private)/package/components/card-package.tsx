"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdatePackageSatus } from "@/domain/package/queries";
import { Package, StatusPackage } from "@/domain/package/types";
import { User } from "@/domain/user/types";
import { Bike, Check, MapPin, Navigation, X } from "lucide-react";
import { WhatsAppButton } from "./button-whatsapp";

interface Delivery {
  delivery: Package;
  user: User;
  numberPackage: number;
}

type DeliveryStatus = StatusPackage;
export function CardPackage({ delivery, user, numberPackage }: Delivery) {
  const { mutateAsync } = useUpdatePackageSatus(user.id);

  const getStatusText = (status: DeliveryStatus) => {
    switch (status) {
      case StatusPackage.PENDING:
        return "Pendente";
      case StatusPackage.IN_TRANSIT:
        return "Em trânsito";
      case StatusPackage.DELIVERED:
        return "Entregue";
      case StatusPackage.CANCELED:
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleUpdateStatus = async (status: DeliveryStatus) => {
    await mutateAsync({ status, id: delivery.id });
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case StatusPackage.IN_TRANSIT:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case StatusPackage.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case StatusPackage.CANCELED:
        return "bg-red-100 text-red-800 border-red-200";
      case StatusPackage.PENDING:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openInMaps = (address: string, cep: string) => {
    // Combinar endereço e CEP para mais precisão
    const fullAddress = `${address}, ${cep}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    // A URL correta para buscar e exibir um endereço
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <Card key={delivery.id} className="bg-transparent mt-6">
      <CardHeader >
        <div className="flex items-center justify-between">
          <div className="text-md rounded-full border border-yellow-500">
            <span className="p-2 ">{numberPackage}</span>
          </div>
          <Badge className={getStatusColor(delivery.status)}>
            {getStatusText(delivery.status)}
          </Badge>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold ">
              {delivery.nameProduct}
            </CardTitle>
            <div className="flex flex-row gap-4 items-center justify-center">
              <p className="text-sm text-muted-foreground mt-1">
                Para: {delivery.nameDestinary}
              </p>
              <WhatsAppButton
                variant="outline"
                phone={delivery.phone || ""}
                message="Ola, sou o entregador"
                isMobile={false}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4  mt-1 flex-shrink-0" />
          <div className="text-sm  leading-relaxed">
            <p>{delivery.address.toLocaleUpperCase()}</p>
            <p className="text-gray-500">CEP: {delivery.cep}</p>
          </div>
        </div>

        {delivery.description && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Observações:</strong> {delivery.description}
            </p>
          </div>
        )}

        <div className="flex flex-row gap-2 items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInMaps(delivery.address, delivery.cep || "")} // Passe o endereço e o CEP
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Abrir no Mapa
          </Button>

          <div className="flex flex-row gap-2">
            {delivery.status === StatusPackage.PENDING && (
              <Button
                size="sm"
                variant={"outline"}
                onClick={() => handleUpdateStatus(StatusPackage.IN_TRANSIT)}
                className="flex-1 border-[1px] border-yellow-500  hover:bg-yellow-700"
              >
                <Bike className="h-4 w-4 text-yellow-500" />
              </Button>
            )}

            {delivery.status !== StatusPackage.DELIVERED &&
              delivery.status !== StatusPackage.CANCELED && (
                <>
                  <Button
                    size="sm"
                    variant={"outline"}
                    onClick={() => handleUpdateStatus(StatusPackage.DELIVERED)}
                    className="flex-1 border-[1px] border-emerald-500  hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(StatusPackage.CANCELED)}
                    className="flex-1 border-[1px] border-red-500  hover:bg-red-700"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
