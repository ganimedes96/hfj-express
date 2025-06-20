import { Header } from "@/components/header/header";
import { getUser } from "@/domain/user/server";
import { PackageList } from "./components/package-list";
import { FormModal } from "@/components/form/containers/form-modal";
import { FormRegister } from "./components/package-form";
import { Plus } from "lucide-react";

export default async function Package() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} />
          <FormModal
            title="Novo pacote"
            description="Adicione um novo pacote"
            formComponent={FormRegister}
            formProps={{ user }}
            customButton={
              <Plus
                size={20}
                className="z-50 text-muted fixed bottom-10 right-10 bg-primary rounded-full  w-14 h-14 p-3 "
              />
            }
          />
      <div className="min-h-screen  p-4 ">
        <div className="max-w-4xl mx-auto">
          <PackageList user={user} />
        </div>
      </div>
    </>
  );
}
