import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-heading text-2xl text-blue-600">LocaFlow</span>
        </div>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl font-semibold text-slate-800">
                Erreur de connexion
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Une erreur est survenue lors de la connexion. Vérifiez vos identifiants et réessayez.
            </p>
            <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">
              <Link href="/auth/signin">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
