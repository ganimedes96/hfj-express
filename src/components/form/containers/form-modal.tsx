/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; 
import { Button, type ButtonProps } from "@/components/ui/button"; 

interface FormModalProps {
  title: string;
  buttonText?: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  formComponent: React.ComponentType<any>;
  formProps: Record<string, unknown>;
  className?: string;
  description: string;
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
}

export function FormModal({
  title,
  buttonText = "Open Form",
  buttonVariant = "outline",
  buttonSize = "sm",
  formComponent: FormComponent,
  formProps,
  className,
  description,
  customButton,
  onOpenChange,
}: FormModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const enhancedFormProps = {
    ...formProps,
    onSuccess: handleSuccess,
  };

  const toggleModal = () => {
    setOpen(!open);
    if (onOpenChange) {
      onOpenChange(!open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={toggleModal}>
      <DialogTrigger asChild>
        {customButton || (
          <Button size={buttonSize} variant={buttonVariant}>
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={className || "m-0 p-2 w-full"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FormComponent {...enhancedFormProps} />
      </DialogContent>
    </Dialog>
  );
}