import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlert {
  title: string;
  description: string;
}

export function ErrorNotification({ title, description }: ErrorAlert) {
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4 mt-2" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
