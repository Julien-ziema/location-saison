"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/lib/types/property";
import type { CreateBookingInput } from "@/lib/types/booking";

const bookingSchema = z.object({
  propertyId: z.string().uuid("Sélectionner un bien valide"),
  guestName: z.string().min(2, "Minimum 2 caractères"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  checkIn: z.string().min(1, "Date requise"),
  checkOut: z.string().min(1, "Date requise"),
  totalAmount: z.coerce.number().positive("Montant positif requis"),
  depositPercent: z.coerce.number().min(10).max(100).default(30),
  cautionAmount: z.coerce.number().positive("Montant caution positif requis"),
  balanceLeadDays: z.coerce.number().min(1).max(90).default(21),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  properties: Property[];
  onSubmit: (data: CreateBookingInput, intent: "draft" | "send") => void;
  isSubmitting?: boolean;
}

export function BookingForm({ properties, onSubmit, isSubmitting = false }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      depositPercent: 30,
      balanceLeadDays: 21,
    },
  });

  function toInput(values: BookingFormValues): CreateBookingInput {
    return {
      propertyId: values.propertyId,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      totalAmount: Math.round(values.totalAmount * 100),
      depositPercent: values.depositPercent,
      cautionAmount: Math.round(values.cautionAmount * 100),
      balanceLeadDays: values.balanceLeadDays,
      notes: values.notes,
    };
  }

  function handleDraft(values: BookingFormValues) {
    onSubmit(toInput(values), "draft");
  }

  function handleSend(values: BookingFormValues) {
    onSubmit(toInput(values), "send");
  }

  return (
    <Form {...form}>
      <form className="space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Bien</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un bien" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du locataire</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone (optionnel)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+33 6 00 00 00 00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrivée</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Départ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant total (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="1500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depositPercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acompte (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="10" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cautionAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caution (€)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="balanceLeadDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde avant arrivée (jours)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Notes (optionnel)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Informations complémentaires..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleDraft)}
            className="flex-1"
          >
            Créer en brouillon
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSend)}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
          >
            Créer et envoyer l&apos;acompte
          </Button>
        </div>
      </form>
    </Form>
  );
}
