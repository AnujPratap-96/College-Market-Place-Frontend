import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HelpCircle, IndianRupee, Calendar, Loader2 } from 'lucide-react';
import { createWantedRequest } from '../wanted.api';
import { toast } from '@/components/ui/toast';
import { isAxiosError } from 'axios';

interface CreateWantedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Books',
  'Lab Equipment',
  'Furniture',
  'Cycle & Mobility',
  'Sports & Fitness',
  'Clothing',
  'Hostel Essentials',
  'Other',
];

export const CreateWantedModal: React.FC<CreateWantedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budget, setBudget] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      toast.error('Title must be at least 3 characters.');
      return;
    }

    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Enter a valid budget amount.');
      return;
    }

    if (!neededBy) {
      toast.error('Please specify when you need this item by.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      await createWantedRequest({
        title: title.trim(),
        category,
        budget: budgetNum,
        neededBy: new Date(neededBy).toISOString(),
        description: description.trim(),
      });
      toast.success('Wanted request broadcasted to campus peers!');
      setTitle('');
      setBudget('');
      setNeededBy('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to post wanted request';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] bg-background border border-border/80 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-1">
            <HelpCircle size={22} />
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            Post to Campus Wanted Board
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Looking for something specific? Announce it to fellow students and receive direct pitches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-foreground">
              What do you need?
            </Label>
            <Input
              id="title"
              placeholder="e.g., Casio fx-991EX Calculator, Engineering Graphics Drafter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-xl bg-muted/30 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-bold text-foreground">
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-xl bg-muted/30 border border-input px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-xs font-bold text-foreground">
                Max Budget (₹)
              </Label>
              <div className="relative">
                <IndianRupee
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="budget"
                  type="number"
                  placeholder="500"
                  min="1"
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-10 pl-8 rounded-xl bg-muted/30 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neededBy" className="text-xs font-bold text-foreground">
              Needed By Date
            </Label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="neededBy"
                type="date"
                min={todayStr}
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="h-10 pl-8 rounded-xl bg-muted/30 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-foreground">
              Details & Specifications
            </Label>
            <Textarea
              id="description"
              placeholder="Specify model, acceptable condition, hostel location, or urgent exam date..."
              rows={3}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="rounded-xl bg-muted/30 text-xs resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-5 shadow-md shadow-orange-500/20"
            >
              {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Broadcast Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
