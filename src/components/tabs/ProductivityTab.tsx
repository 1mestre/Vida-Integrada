
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PomodoroTimer from '@/components/productivity/PomodoroTimer';
import TaskManager from '@/components/productivity/TaskManager';
import AmbiancePlayer from '@/components/productivity/AmbiancePlayer';
import ProductivityHeader from '@/components/productivity/ProductivityHeader';

const ProductivityTab = () => {
  return (
    <div className="space-y-8">
      <ProductivityHeader />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>
        <div className="lg:col-span-2">
          <TaskManager />
        </div>
      </div>
      <div>
        <AmbiancePlayer />
      </div>
    </div>
  );
};

export default ProductivityTab;
