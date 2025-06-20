"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockIcon, Mail, Phone, User } from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { useCreateUserServer } from "@/domain/user/queries";
import { StatusServer } from "@/api/types";
import Logo from "../../../../assets/logo.png";
import Image from "next/image";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";

const registerSchema = z
  .object({
    role: z.enum(["admin", "deliveryDrive"]),
    name: z.string().min(3, "O sobrenome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Formato de e-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    phone: z.string().optional(),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export function FormRegister() {
  const { mutateAsync } = useCreateUserServer();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      confirmPassword: "",
      role: "deliveryDrive",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    console.log(data);

    await mutateAsync(
      {
        ...data,
        emailVerified: false,
        active: true,
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
    <Card className="w-full max-w-[600px]">
      <CardHeader className="flex flex-col items-center">
        <Image src={Logo} alt="Logo" width={100} height={100} />
        <CardTitle className="text-2xl">Criar sua conta</CardTitle>
        <CardDescription>
          Preencha os dados para começar seu teste gratuito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ControlledInput
            control={control}
            placeholder="Silva de Souza"
            name="name"
            iconPosition="left"
            icon={<User className="h-4 w-4 text-muted-foreground" />}
            label="Nome *"
          />

          <ControlledInput
            control={control}
            iconPosition="left"
            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
            placeholder="E-mail"
            name="email"
            label="E-mail *"
          />
          <ControlledInput
            control={control}
            placeholder="Telefone"
            maskType="phoneMobile"
            name="phone"
            iconPosition="left"
            icon={<Phone className="h-4 w-4 text-muted-foreground" />}
            label="Telefone"
          />

          <ControlledSelect
            className="w-full"
            control={control}
            name="role"
            options={[
              { id: "deliveryDrive", name: "Entregador" },
              { id: "admin", name: "Administrador" },
            ]}
            label="Tipo de Usuário"
            placeholder="Selecione um perfil"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ControlledInput
              control={control}
              placeholder="minimo 6 caracteres"
              name="password"
              iconPosition="left"
              icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
              label="Senha *"
              type="password"
            />

            <ControlledInput
              control={control}
              iconPosition="left"
              icon={<LockIcon className="h-4 w-4 text-muted-foreground" />}
              placeholder="Digite a mesma senha"
              name="confirmPassword"
              label="Confirmar senha *"
              type="password"
            />
          </div>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
          {Object.entries(errors).map(([key, value]) => (
            <p key={key} className="text-red-500 text-sm">
              {key}:{" "}
              {"message" in value && typeof value.message === "string"
                ? value.message
                : ""}
            </p>
          ))}
        </form>
      </CardContent>
    </Card>
  );
}
