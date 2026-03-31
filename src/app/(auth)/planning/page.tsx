'use client'

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { KanbanBoard } from "@/components/planning/KanbanBoard";
import { useBookings } from "@/lib/hooks/use-bookings";

export default function PlanningPage() {
  const { data: bookings = [], isLoading } = useBookings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        description="Vue Kanban de vos reservations par statut"
        action={
          <Button
            asChild
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
          >
            <Link href="/bookings/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle reservation
            </Link>
          </Button>
        }
      />

      <KanbanBoard bookings={bookings} isLoading={isLoading} />
    </div>
  );
}
