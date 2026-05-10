import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getCases, deleteCase } from '@/lib/store';
import { InheritanceCase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Trash2, Eye, Calculator, FolderOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Dashboard() {
  const { t } = useTranslation();
  const [cases, setCases] = useState<InheritanceCase[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setCases(await getCases());
    } catch (e: any) {
      toast.error(e.message || 'Failed to load cases');
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteCase(id);
      toast.success(t('case.deleted'));
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const statusVariant = (s: string): any =>
    s === 'draft' ? 'secondary' : s === 'calculated' ? 'default' : 'outline';

  const stats = {
    total: cases.length,
    draft: cases.filter(c => c.status === 'draft').length,
    calculated: cases.filter(c => c.status === 'calculated').length,
    distributed: cases.filter(c => c.status === 'distributed').length,
  };

  return (
    <div className="container py-6 sm:py-8 px-3 sm:px-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/case/new"><Plus className="me-2 h-5 w-5" />{t('case.create')}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t('dashboard.totalCases'), value: stats.total, icon: FileText },
          { label: t('dashboard.draft'), value: stats.draft, icon: FolderOpen },
          { label: t('dashboard.calculated'), value: stats.calculated, icon: Calculator },
          { label: t('dashboard.distributed'), value: stats.distributed, icon: Eye },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent shrink-0">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold leading-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : cases.length === 0 ? (
        <Card className="py-12 sm:py-16">
          <CardContent className="text-center space-y-4 px-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h2 className="text-lg sm:text-xl font-semibold">{t('dashboard.noCases')}</h2>
            <p className="text-sm text-muted-foreground">{t('dashboard.noCasesDesc')}</p>
            <Button asChild><Link to="/case/new">{t('dashboard.createFirst')}</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg break-words">{c.deceased_name}</CardTitle>
                    <Badge variant={statusVariant(c.status)}>{t(`dashboard.${c.status}`)}</Badge>
                  </div>
                  {c.deceased_date && <p className="text-xs sm:text-sm text-muted-foreground">{c.deceased_date}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  {c.notes && <p className="text-sm text-muted-foreground line-clamp-2">{c.notes}</p>}
                  <p className="text-sm font-medium">{t('case.totalEstate')}: {t('common.currency')}{c.total_estate.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link to={`/case/${c.id}`}><Eye className="me-1 h-3 w-3" />{t('case.viewDetails')}</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" aria-label={t('case.delete')}><Trash2 className="h-3 w-3" /></Button>
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
