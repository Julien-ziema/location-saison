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
import { AmenitiesField } from "@/components/properties/AmenitiesField";
import { PhotosField } from "@/components/properties/PhotosField";
import type { CreatePropertyInput } from "@/lib/types/property";

const propertySchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  address: z.string().min(5, "Minimum 5 caractères"),
  description: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0).optional().or(z.literal("")),
  bathrooms: z.coerce.number().int().min(0).optional().or(z.literal("")),
  surface: z.coerce.number().positive().optional().or(z.literal("")),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
  pricePerNight: z.coerce.number().positive().optional().or(z.literal("")),
  defaultDepositPercent: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  defaultCautionAmount: z.coerce.number().positive().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  onSubmit: (data: CreatePropertyInput) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CreatePropertyInput>;
}

function toFormDefaults(dv?: Partial<CreatePropertyInput>): Partial<FormValues> {
  return {
    name: dv?.name ?? "",
    address: dv?.address ?? "",
    description: dv?.description ?? "",
    capacity: dv?.capacity ?? "",
    bedrooms: dv?.bedrooms ?? "",
    bathrooms: dv?.bathrooms ?? "",
    surface: dv?.surface ?? "",
    amenities: dv?.amenities ?? [],
    photos: dv?.photos ?? [],
    pricePerNight: dv?.pricePerNight ? dv.pricePerNight / 100 : "",
    defaultDepositPercent: dv?.defaultDepositPercent ?? "",
    defaultCautionAmount: dv?.defaultCautionAmount ? dv.defaultCautionAmount / 100 : "",
  };
}

export function PropertyForm({ onSubmit, isSubmitting = false, defaultValues }: PropertyFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: toFormDefaults(defaultValues),
  });

  function handleSubmit(values: FormValues) {
    const data: CreatePropertyInput = {
      name: values.name,
      address: values.address,
      description: values.description || undefined,
      capacity: values.capacity ? Number(values.capacity) : undefined,
      bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
      bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
      surface: values.surface ? Number(values.surface) : undefined,
      amenities: values.amenities?.length ? values.amenities : undefined,
      photos: values.photos?.length ? values.photos : undefined,
      pricePerNight: values.pricePerNight ? Math.round(Number(values.pricePerNight) * 100) : undefined,
      defaultDepositPercent: values.defaultDepositPercent ? Number(values.defaultDepositPercent) : undefined,
      defaultCautionAmount: values.defaultCautionAmount ? Math.round(Number(values.defaultCautionAmount) * 100) : undefined,
    };
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Section title="Informations générales">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du bien</FormLabel>
              <FormControl><Input placeholder="Villa Les Pins" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl><Input placeholder="12 rue des Mimosas, 83000 Toulon" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl><Textarea placeholder="Description du bien..." rows={3} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Section>

        <Section title="Caractéristiques">
          <div className="grid grid-cols-2 gap-4">
            <NumberField form={form} name="capacity" label="Capacité (pers.)" placeholder="6" />
            <NumberField form={form} name="bedrooms" label="Chambres" placeholder="3" />
            <NumberField form={form} name="bathrooms" label="Salles de bain" placeholder="2" />
            <NumberField form={form} name="surface" label="Surface (m²)" placeholder="120" />
          </div>
        </Section>

        <Section title="Equipements">
          <FormField control={form.control} name="amenities" render={({ field }) => (
            <FormItem>
              <FormControl>
                <AmenitiesField value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
        </Section>

        <Section title="Photos">
          <FormField control={form.control} name="photos" render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhotosField value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Section>

        <Section title="Tarification">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField form={form} name="pricePerNight" label="Prix / nuit (EUR)" placeholder="150" />
            <NumberField form={form} name="defaultDepositPercent" label="Acompte (%)" placeholder="30" />
            <NumberField form={form} name="defaultCautionAmount" label="Caution (EUR)" placeholder="500" />
          </div>
        </Section>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          Enregistrer
        </Button>
      </form>
    </Form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-slate-700">{title}</legend>
      {children}
    </fieldset>
  );
}

function NumberField({
  form,
  name,
  label,
  placeholder,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  placeholder: string;
}) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type="number" placeholder={placeholder} {...field} value={field.value as string | number} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}
