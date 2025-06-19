import type React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ButtonLogout } from "./button-logout";
import { ToggleTheme } from "../toggle-theme/toggle-theme";

import Link from "next/link";
import { User } from "@/domain/user/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getUserInitials } from "@/utils/get-user-initials";

import StockBit from "../../assets/header.png";
import Image from "next/image";

interface HeaderProps {
  children?: React.ReactNode;
  user: User;
}

export async function Header({ children, user }: HeaderProps) {
  return (
    <header className="flex flex-col items-center bg-sidebar px-4 w-full">
      <div className="w-full  flex items-center justify-between">
        <div className="flex items-center">
          <Image src={StockBit} width={70} height={70} alt="StockBit" />
          {/* <h1 className="text-2xl font-medium hidden md:block ml-2">HFJ-Express</h1> */}
        </div>

        <div className="flex items-center gap-4">
          {children}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full text-primary">
                <Avatar>
                  <AvatarImage src={''} alt="" />
                  <AvatarFallback>
                    {getUserInitials(`${user.name}`)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Olá {user.name} 👋</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === "admin" && (
                <>
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/upgrade" className="w-full">
                      Planos
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <ToggleTheme />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <ButtonLogout />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* <Separator className="w-full bg-yellow-500/55" />

      {/* Nav com scroll horizontal já configurado */}
      {/* <Nav items={navItems} /> */} 
    </header>
  );
}
