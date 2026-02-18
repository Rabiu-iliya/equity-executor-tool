import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getCases, deleteCase } from '@/lib/store';
import { InheritanceCase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Trash2, Eye, Calculator, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<InheritanceCase[]>([]);

  useEffect(() => { setCases(getCases()); }, []);

  const handleDelete = (id: string) => {
    deleteCase(id);
    setCases(getCases());
  };

  const statusVariant = (s: string) =>
    s === 'draft' ? 'secondary' : s === 'calculated' ? 'default' : 'outline';

  const stats = {
    total: cases.length,
    draft: cases.filter(c => c.status === 'draft').length,
    calculated: cases.filter(c => c.status === 'calculated').length,
    distributed: cases.filter(c => c.status === 'distributed').length,
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Button asChild size="lg">
          <Link to="/case/new"><Plus className="mr-2 h-5 w-5" />{t('case.create')}</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.totalCases'), value: stats.total, icon: FileText },
          { label: t('dashboard.draft'), value: stats.draft, icon: FolderOpen },
          { label: t('dashboard.calculated'), value: stats.calculated, icon: Calculator },
          { label: t('dashboard.distributed'), value: stats.distributed, icon: Eye },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <stat.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cases list */}
      {cases.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center space-y-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-xl font-semibold">{t('dashboard.noCases')}</h2>
            <p className="text-muted-foreground">{t('dashboard.noCasesDesc')}</p>
            <Button asChild><Link to="/case/new">{t('dashboard.createFirst')}</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{c.deceased_name}</CardTitle>
                    <Badge variant={statusVariant(c.status)}>{t(`dashboard.${c.status}`)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.deceased_date}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {c.notes && <p className="text-sm text-muted-foreground line-clamp-2">{c.notes}</p>}
                  <p className="text-sm font-medium">{t('case.totalEstate')}: {t('common.currency')}{c.total_estate.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link to={`/case/${c.id}`}><Eye className="mr-1 h-3 w-3" />{t('case.viewDetails')}</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('case.delete')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('case.deleteConfirm')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(c.id)}>{t('common.delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
