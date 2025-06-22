"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAppState } from '@/context/AppStateContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, PlusCircle, Trash2, TrendingUp } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const IncomeTab = () => {
  const { appState, setAppState } = useAppState();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [amount, setAmount] = useState('');
  
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentMonthTarget = appState.monthlyTargets[currentMonthKey] || 0;

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        setExchangeRate(data.rates.COP);
        setRateLoading(false);
      })
      .catch(() => {
        setExchangeRate(4000); // Fallback
        setRateLoading(false);
      });
  }, []);

  const handleAddIncome = () => {
    if (!amount || !exchangeRate) return;
    const numericAmount = parseFloat(amount);
    let newContribution;

    if (appState.selectedInputCurrencyIngresos === 'USD') {
      const fee = 3;
      const percentageFee = 0.03;
      if (numericAmount <= fee) return; // Not enough to cover fee
      const netUSD = (numericAmount - fee) * (1 - percentageFee);
      const netCOP = netUSD * exchangeRate;
      newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
    } else {
      const netCOP = numericAmount;
      const netUSD = netCOP / exchangeRate;
      newContribution = { id: new Date().toISOString(), date: new Date().toISOString(), netUSD, rate: exchangeRate, netCOP };
    }
    
    setAppState({ contributions: [newContribution, ...appState.contributions] });
    setAmount('');
  };

  const handleClearHistory = () => {
    setAppState({ contributions: [], monthlyTargets: {} });
  };
  
  const financialSummary = useMemo(() => {
    const totalNetCOP = appState.contributions.reduce((sum, c) => sum + c.netCOP, 0);
    const totalNetUSD = appState.contributions.reduce((sum, c) => sum + c.netUSD, 0);
    const incomeThisMonth = appState.contributions
      .filter(c => c.date.startsWith(currentMonthKey))
      .reduce((sum, c) => sum + c.netCOP, 0);
    const progress = currentMonthTarget > 0 ? (incomeThisMonth / currentMonthTarget) * 100 : 0;
    
    return { totalNetCOP, totalNetUSD, incomeThisMonth, progress };
  }, [appState.contributions, currentMonthTarget, currentMonthKey]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card className="glassmorphism-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 text-primary" />
              Meta de Ingresos - {format(new Date(), 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <CardDescription>Establece y sigue tu objetivo de ingresos mensuales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Meta en COP"
                value={currentMonthTarget || ''}
                onChange={(e) => setAppState({ monthlyTargets: { ...appState.monthlyTargets, [currentMonthKey]: Number(e.target.value) } })}
                className="bg-background/50 border-border"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Progreso: {formatCOP(financialSummary.incomeThisMonth)} / {formatCOP(currentMonthTarget)}
              </span>
            </div>
            
            <div className="space-y-2">
                <p className="text-sm font-medium">Progreso Meta del Mes</p>
                <Progress value={financialSummary.progress} className="h-4 shimmer [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-emerald-600"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={appState.selectedInputCurrencyIngresos} onValueChange={(val: 'USD' | 'COP') => setAppState({ selectedInputCurrencyIngresos: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="COP">COP</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={`Monto en ${appState.selectedInputCurrencyIngresos}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="sm:col-span-2 bg-background/50 border-border"
              />
            </div>
            <Button onClick={handleAddIncome} disabled={rateLoading || !amount} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              {rateLoading ? 'Cargando tasa...' : 'Añadir Ingreso'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Tasa de cambio actual (USD a COP): {rateLoading ? '...' : exchangeRate?.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="glassmorphism-card">
                <CardHeader><CardTitle>Historial de Ingresos</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <ul className="space-y-3 pr-4">
                            {appState.contributions.map(c => (
                                <li key={c.id} className="text-sm border-b border-border/50 pb-2">
                                    <div className="flex justify-between font-medium">
                                        <span>{format(new Date(c.date), 'dd MMM yyyy', { locale: es })}</span>
                                        <span className="text-green-400">{formatCOP(c.netCOP)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatUSD(c.netUSD)} @ {c.rate.toFixed(2)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
             <Card className="glassmorphism-card">
                <CardHeader><CardTitle>Progreso Metas Mensuales</CardTitle></CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                       <ul className="space-y-3 pr-4">
                            {Object.entries(appState.monthlyTargets).reverse().map(([key, target]) => {
                                const monthIncome = appState.contributions
                                    .filter(c => c.date.startsWith(key))
                                    .reduce((sum, c) => sum + c.netCOP, 0);
                                const achieved = monthIncome >= target;
                                return (
                                    <li key={key} className="text-sm border-b border-border/50 pb-2">
                                        <p className="font-medium">{format(new Date(key), 'MMMM yyyy', { locale: es })}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">{formatCOP(monthIncome)} / {formatCOP(target)}</span>
                                            <span className={`font-bold ${achieved ? 'text-green-400' : 'text-orange-400'}`}>
                                                {achieved ? 'Logrado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="space-y-6">
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">Ingreso Neto Total</p>
            <p className="text-4xl font-bold text-green-400 text-shadow-neon">{formatCOP(financialSummary.totalNetCOP)}</p>
        </Card>
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">Ingreso Neto Total (USD)</p>
            <p className="text-3xl font-semibold text-blue-400 text-shadow-neon">{formatUSD(financialSummary.totalNetUSD)}</p>
        </Card>
        <Card className="glassmorphism-card text-center p-6">
            <p className="text-sm text-muted-foreground">Ingresos Este Mes</p>
            <p className="text-3xl font-semibold">{formatCOP(financialSummary.incomeThisMonth)}</p>
        </Card>
        {financialSummary.progress >= 100 && (
            <Card className="glassmorphism-card bg-green-500/20 border-green-500 p-4 text-center">
                <p className="font-bold text-green-300 animate-pulse">🎉✨ ¡FELICITACIONES! ¡META ALCANZADA! ✨🎉</p>
            </Card>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Limpiar Todo el Historial
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente todos los ingresos y metas guardados. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default IncomeTab;
