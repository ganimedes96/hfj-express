"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { StatusServer } from "@/api/types";
import { useCreatePackageServer } from "@/domain/package/queries";
import { User } from "@/domain/user/types";
import { StatusPackage } from "@/domain/package/types";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";

const packageSchema = z.object({
  nameProduct: z.string().optional(),
  nameDestinary: z.string().min(1, "O nome do destinatario e obrigatorio"),
  address: z.string().min(1, "O endereco e obrigatorio"),
  cep: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

export type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  user: User;
}

export function FormRegister({ user }: PackageFormProps) {
  const { mutateAsync } = useCreatePackageServer(user.id);

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      nameProduct: "",
      nameDestinary: "",
      address: "",
      phone: "",
      cep: "",
      description: "",
    },
  });

  async function onSubmit(data: PackageFormData) {
    await mutateAsync(
      {
        ...data,
        status: StatusPackage.PENDING,
      },
      {
        onSuccess: (response) => {
          if (response.status === StatusServer.success) {
            reset();
          }
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ControlledInput
        control={control}
        placeholder="Ex: Notebook"
        name="nameProduct"
        label="Nome do produto"
      />

      <ControlledInput
        control={control}
        placeholder="Ex: Joao da Silva"
        name="nameDestinary"
        label="Nome do destinatario *"
      />
      <div className="grid grid-cols-2 gap-2">
        <ControlledInput
          control={control}
          placeholder="Ex: 12345678"
          name="phone"
          label="Telefone "
          maskType="phoneMobile"
        />

        <ControlledInput
          control={control}
          placeholder="Ex: 12345678"
          name="cep"
          label="CEP "
          maskType="cep"
        />
      </div>
      <ControlledInput
        control={control}
        placeholder="Ex: Rua das Flores, 123 - Centro, Timon - MA"
        name="address"
        label="Endereço de entrega *"
      />

      <ControlledTextarea
        control={control}
        limit={100}
        placeholder="Ex: Descrição do produto"
        name="description"
        label="Descrição"
      />

      <Button disabled={isSubmitting} className="w-full" type="submit">
        {isSubmitting ? "Cadastrando..." : "Cadastrar Entrega"}
      </Button>
    </form>
  );
}
