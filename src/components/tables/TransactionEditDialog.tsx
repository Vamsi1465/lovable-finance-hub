import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Predefined options for dropdowns
const PERSONAL_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Rent',
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Utilities',
  'Other',
];

const AGENCY_SERVICES = [
  'Web Development',
  'App Development',
  'UI/UX Design',
  'SEO',
  'Digital Marketing',
  'Content Writing',
  'Video Production',
  'Consulting',
  'Maintenance',
  'Other',
];

const AGENCY_EXPENSE_CATEGORIES = [
  'Salary',
  'Software',
  'Hardware',
  'Marketing',
  'Office Rent',
  'Utilities',
  'Travel',
  'Training',
  'Subscriptions',
  'Other',
];

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Cheque',
  'Other',
];

export type TransactionType = 'personalIncome' | 'personalExpense' | 'agencyIncome' | 'agencyExpense';

interface TransactionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Record<string, any> | null;
  transactionType: TransactionType;
  onSave: (updatedData: Record<string, any>) => void;
  mode: 'edit' | 'add';
}

export const TransactionEditDialog = ({
  open,
  onOpenChange,
  transaction,
  transactionType,
  onSave,
  mode,
}: TransactionEditDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({ ...transaction });
    } else {
      // Initialize empty form for add mode
      setFormData(getEmptyForm(transactionType));
    }
  }, [transaction, transactionType]);

  const getEmptyForm = (type: TransactionType): Record<string, any> => {
    const today = new Date().toISOString().split('T')[0];
    switch (type) {
      case 'personalIncome':
      case 'personalExpense':
        return {
          date: today,
          name: '',
          category: '',
          amount: 0,
          paymentMethod: '',
          reason: '',
        };
      case 'agencyIncome':
        return {
          date: today,
          clientName: '',
          service: '',
          amount: 0,
          recurring: false,
          paymentMode: '',
          reason: '',
          nextPaymentDate: null,
        };
      case 'agencyExpense':
        return {
          date: today,
          category: '',
          paidTo: '',
          amount: 0,
          recurring: false,
          paymentMode: '',
          reason: '',
          nextPaymentDate: null,
        };
      default:
        return {};
    }
  };

  const getCategoryOptions = () => {
    switch (transactionType) {
      case 'personalIncome':
      case 'personalExpense':
        return PERSONAL_CATEGORIES;
      case 'agencyIncome':
        return AGENCY_SERVICES;
      case 'agencyExpense':
        return AGENCY_EXPENSE_CATEGORIES;
      default:
        return [];
    }
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderPersonalFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => updateField('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {getCategoryOptions().map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={formData.paymentMethod || ''}
            onValueChange={(value) => updateField('paymentMethod', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason || ''}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={2}
        />
      </div>
    </>
  );

  const renderAgencyIncomeFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name</Label>
        <Input
          id="clientName"
          value={formData.clientName || ''}
          onChange={(e) => updateField('clientName', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <Select
            value={formData.service || ''}
            onValueChange={(value) => updateField('service', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {AGENCY_SERVICES.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <Select
            value={formData.paymentMode || ''}
            onValueChange={(value) => updateField('paymentMode', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurring">Recurring</Label>
          <Select
            value={formData.recurring ? 'true' : 'false'}
            onValueChange={(value) => updateField('recurring', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
          <Input
            id="nextPaymentDate"
            type="date"
            value={formData.nextPaymentDate || ''}
            onChange={(e) => updateField('nextPaymentDate', e.target.value || null)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason || ''}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={2}
        />
      </div>
    </>
  );

  const renderAgencyExpenseFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="paidTo">Paid To</Label>
        <Input
          id="paidTo"
          value={formData.paidTo || ''}
          onChange={(e) => updateField('paidTo', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => updateField('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {AGENCY_EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <Select
            value={formData.paymentMode || ''}
            onValueChange={(value) => updateField('paymentMode', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurring">Recurring</Label>
          <Select
            value={formData.recurring ? 'true' : 'false'}
            onValueChange={(value) => updateField('recurring', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
          <Input
            id="nextPaymentDate"
            type="date"
            value={formData.nextPaymentDate || ''}
            onChange={(e) => updateField('nextPaymentDate', e.target.value || null)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason || ''}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={2}
        />
      </div>
    </>
  );

  const renderFields = () => {
    switch (transactionType) {
      case 'personalIncome':
      case 'personalExpense':
        return renderPersonalFields();
      case 'agencyIncome':
        return renderAgencyIncomeFields();
      case 'agencyExpense':
        return renderAgencyExpenseFields();
      default:
        return null;
    }
  };

  const getTitle = () => {
    const action = mode === 'edit' ? 'Edit' : 'Add';
    switch (transactionType) {
      case 'personalIncome':
        return `${action} Personal Income`;
      case 'personalExpense':
        return `${action} Personal Expense`;
      case 'agencyIncome':
        return `${action} Agency Income`;
      case 'agencyExpense':
        return `${action} Agency Expense`;
      default:
        return `${action} Transaction`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">{renderFields()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'edit' ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
