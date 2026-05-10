import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createCase } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewCase() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ deceased_name: '', deceased_date: '', notes: '', total_estate: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deceased_name.trim()) return;
    setBusy(true);
    try {
      const c = await createCase(form);
      toast.success(t('case.created'));
      navigate(`/case/${c.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create case');
      setBusy(false);
    }
  };

  return (
    <div className="container max-w-2xl py-6 sm:py-8 px-3 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{t('case.create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('case.deceasedName')}</Label>
              <Input required maxLength={120} value={form.deceased_name} onChange={e => setForm({ ...form, deceased_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.deceasedDate')}</Label>
              <Input type="date" value={form.deceased_date} onChange={e => setForm({ ...form, deceased_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.totalEstate')}</Label>
              <Input type="number" min="0" step="0.01" value={form.total_estate || ''} onChange={e => setForm({ ...form, total_estate: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.notes')}</Label>
              <Textarea maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">{t('case.cancel')}</Button>
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('case.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
