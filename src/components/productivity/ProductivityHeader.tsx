"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, Target } from "lucide-react";

const ProductivityHeader = () => {
    return (
        <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">
                Productividad
            </h1>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <Card className="glassmorphism-card text-left">
                    <CardContent className="p-4">
                        <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>OBJETIVO PRIMORDIAL DE HOY</h3>
                        <p className="text-sm text-muted-foreground">Vencer la inercia y construir momentum positivo.</p>
                    </CardContent>
                </Card>
                 <Card className="glassmorphism-card text-left">
                    <CardContent className="p-4">
                        <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-400"/>INSIGHT CLAVE</h3>
                        <p className="text-sm text-muted-foreground">El momentum se construye con una pequeña acción, no con un gran salto.</p>
                    </CardContent>
                </Card>
            </div>
        </header>
    );
}

export default ProductivityHeader;
