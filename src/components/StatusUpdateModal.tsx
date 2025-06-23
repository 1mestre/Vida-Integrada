
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KanbanTask, WorkItem } from '@/context/AppStateContext';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: KanbanTask;
  targetColumn: 'todo' | 'inprogress' | 'done';
  onConfirm: (newStatus: WorkItem['deliveryStatus']) => void;
}

const columnToStatusMap: { [key in StatusUpdateModalProps['targetColumn']]: WorkItem['deliveryStatus'][] } = {
  todo: ['Pending'],
  inprogress: ['In Transit', 'In Revision'],
  done: ['Delivered', 'Returned'],
};

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ isOpen, onClose, task, targetColumn, onConfirm }) => {
  const availableStatuses = useMemo(() => columnToStatusMap[targetColumn] || [], [targetColumn]);
  const [selectedStatus, setSelectedStatus] = useState<WorkItem['deliveryStatus'] | ''>('');

  useEffect(() => {
    if (isOpen) {
      // Pre-select the first available status when the modal opens
      setSelectedStatus(availableStatuses[0] || '');
    }
  }, [isOpen, availableStatuses]);
  
  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-card">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de la Orden</DialogTitle>
          <DialogDescription>
            La tarea "{task.content}" está vinculada a una orden. Por favor, selecciona el nuevo estado de entrega.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="status">Nuevo Estado</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => setSelectedStatus(value as WorkItem['deliveryStatus'])}
              disabled={availableStatuses.length <= 1}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecciona un estado..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedStatus}>Confirmar y Mover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;
