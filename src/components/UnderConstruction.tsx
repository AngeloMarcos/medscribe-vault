import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <Construction className="h-8 w-8 text-warning" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-muted-foreground">
              {description || "Esta funcionalidade está em desenvolvimento e estará disponível em breve."}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
