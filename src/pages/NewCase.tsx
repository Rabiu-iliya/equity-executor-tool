import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createCase } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewCase() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deceased_name: '', deceased_date: '', notes: '', total_estate: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = createCase(form);
    navigate(`/case/${c.id}`);
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('case.create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('case.deceasedName')}</Label>
              <Input required value={form.deceased_name} onChange={e => setForm({ ...form, deceased_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.deceasedDate')}</Label>
              <Input type="date" required value={form.deceased_date} onChange={e => setForm({ ...form, deceased_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.totalEstate')}</Label>
              <Input type="number" min="0" step="0.01" required value={form.total_estate || ''} onChange={e => setForm({ ...form, total_estate: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('case.notes')}</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <Button type="submit">{t('case.save')}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')}>{t('case.cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
