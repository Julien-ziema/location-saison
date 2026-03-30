'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { useCreateProperty } from "@/lib/hooks/use-properties";
import type { CreatePropertyInput } from "@/lib/types/property";

export default function NewPropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();

  async function handleSubmit(data: CreatePropertyInput) {
    await createProperty.mutateAsync(data);
    router.push("/properties");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nouveau bien" />
      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PropertyForm
          onSubmit={handleSubmit}
          isSubmitting={createProperty.isPending}
        />
      </div>
    </div>
  );
}
