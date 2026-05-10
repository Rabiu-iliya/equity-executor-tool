import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCase, updateCase, getHeirs, addHeir, deleteHeir, getAssets, addAsset, deleteAsset } from '@/lib/store';
import { calculateFaraid } from '@/lib/faraid';
import { exportPDF, exportExcel } from '@/lib/export';
import { InheritanceCase, Heir, Asset, HeirRelationship, AssetType, FaraidResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Trash2, Calculator, Users, Landmark, PieChart, Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const RELATIONSHIPS: HeirRelationship[] = [
  'husband', 'wife', 'son', 'daughter', 'father', 'mother',
  'grandfather', 'grandmother', 'brother', 'sister',
  'half_brother_paternal', 'half_sister_paternal',
  'half_brother_maternal', 'half_sister_maternal',
  'grandson', 'granddaughter', 'uncle', 'nephew',
];
const ASSET_TYPES: AssetType[] = ['money', 'property', 'land', 'valuables'];

export default function CaseDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<InheritanceCase | null>(null);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newHeir, setNewHeir] = useState({ name: '', relationship: 'son' as HeirRelationship });
  const [newAsset, setNewAsset] = useState({ type: 'money' as AssetType, description: '', value: 0 });
  const [result, setResult] = useState<FaraidResult | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    try {
      const c = await getCase(id);
      if (!c) { navigate('/'); return; }
      setCaseData(c);
      setHeirs(await getHeirs(id));
      setAssets(await getAssets(id));
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const totalAssetValue = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);

  const handleAddHeir = async () => {
    if (!id || !newHeir.name.trim()) return;
    try {
      await addHeir({ case_id: id, ...newHeir });
      setHeirs(await getHeirs(id));
      setNewHeir({ name: '', relationship: 'son' });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveHeir = async (heirId: string) => {
    try { await deleteHeir(heirId); if (id) setHeirs(await getHeirs(id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleAddAsset = async () => {
    if (!id || !newAsset.description.trim() || newAsset.value <= 0) return;
    try {
      await addAsset({ case_id: id, ...newAsset });
      setAssets(await getAssets(id));
      setNewAsset({ type: 'money', description: '', value: 0 });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveAsset = async (assetId: string) => {
    try { await deleteAsset(assetId); if (id) setAssets(await getAssets(id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleCalculate = async () => {
    if (!caseData || heirs.length === 0) return;
    const estate = totalAssetValue > 0 ? totalAssetValue : caseData.total_estate;
    const r = calculateFaraid(heirs, estate);
    setResult(r);
    if (id) {
      try {
        await updateCase(id, { status: 'calculated', total_estate: estate });
        const c = await getCase(id); if (c) setCaseData(c);
        toast.success(t('calculation.done'));
      } catch (e: any) { toast.error(e.message); }
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!caseData) return;
    try {
      const payload = { caseData, heirs, assets, result, t };
      if (format === 'pdf') exportPDF(payload);
      else exportExcel(payload);
      toast.success(t('case.exported'));
    } catch (e: any) { toast.error(e.message || 'Export failed'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!caseData) return null;

  return (
    <div className="container py-4 sm:py-8 px-3 sm:px-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild className="shrink-0"><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{caseData.deceased_name}</h1>
          {caseData.deceased_date && <p className="text-xs sm:text-sm text-muted-foreground">{caseData.deceased_date}</p>}
        </div>
        <Badge variant="secondary">{t(`dashboard.${caseData.status}`)}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm"><Download className="me-1 h-4 w-4" />{t('case.export')}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}><FileText className="me-2 h-4 w-4" />PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="me-2 h-4 w-4" />Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="heirs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heirs" className="text-xs sm:text-sm"><Users className="me-1 h-4 w-4" /><span className="hidden sm:inline">{t('heir.title')}</span><span className="sm:hidden">{heirs.length}</span></TabsTrigger>
          <TabsTrigger value="assets" className="text-xs sm:text-sm"><Landmark className="me-1 h-4 w-4" /><span className="hidden sm:inline">{t('asset.title')}</span><span className="sm:hidden">{assets.length}</span></TabsTrigger>
          <TabsTrigger value="calculation" className="text-xs sm:text-sm"><PieChart className="me-1 h-4 w-4" /><span className="hidden sm:inline">{t('calculation.title')}</span><span className="sm:hidden">$</span></TabsTrigger>
        </TabsList>

        <TabsContent value="heirs">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5" />{t('heir.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-3">
                <Input placeholder={t('heir.name')} value={newHeir.name} onChange={e => setNewHeir({ ...newHeir, name: e.target.value })} />
                <Select value={newHeir.relationship} onValueChange={(v) => setNewHeir({ ...newHeir, relationship: v as HeirRelationship })}>
                  <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{t(`heir.relationships.${r}`)}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleAddHeir}><Plus className="me-1 h-4 w-4" />{t('heir.add')}</Button>
              </div>

              {heirs.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">{t('heir.noHeirs')}</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('heir.name')}</TableHead>
                        <TableHead>{t('heir.relationship')}</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {heirs.map(h => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.name}</TableCell>
                          <TableCell>{t(`heir.relationships.${h.relationship}`)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveHeir(h.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Landmark className="h-5 w-5" />{t('asset.title')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr_150px_auto] gap-2 sm:gap-3">
                <Select value={newAsset.type} onValueChange={(v) => setNewAsset({ ...newAsset, type: v as AssetType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ASSET_TYPES.map(t2 => <SelectItem key={t2} value={t2}>{t(`asset.types.${t2}`)}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder={t('asset.description')} value={newAsset.description} onChange={e => setNewAsset({ ...newAsset, description: e.target.value })} />
                <Input type="number" placeholder={t('asset.value')} min="0" step="0.01" value={newAsset.value || ''} onChange={e => setNewAsset({ ...newAsset, value: parseFloat(e.target.value) || 0 })} />
                <Button onClick={handleAddAsset}><Plus className="me-1 h-4 w-4" />{t('asset.add')}</Button>
              </div>

              {assets.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">{t('asset.noAssets')}</p>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('asset.type')}</TableHead>
                          <TableHead>{t('asset.description')}</TableHead>
                          <TableHead className="text-end">{t('asset.value')}</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets.map(a => (
                          <TableRow key={a.id}>
                            <TableCell><Badge variant="outline">{t(`asset.types.${a.type}`)}</Badge></TableCell>
                            <TableCell className="break-words max-w-[180px]">{a.description}</TableCell>
                            <TableCell className="text-end font-medium whitespace-nowrap">{t('common.currency')}{a.value.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveAsset(a.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <p className="text-base sm:text-lg font-bold">{t('asset.totalValue')}: {t('common.currency')}{totalAssetValue.toLocaleString()}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculation">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg"><PieChart className="h-5 w-5" />{t('calculation.title')}</CardTitle>
                <Button onClick={handleCalculate} disabled={heirs.length === 0} className="w-full sm:w-auto">
                  <Calculator className="me-1 h-4 w-4" />
                  {result ? t('case.recalculate') : t('case.calculate')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <p className="text-center py-12 text-sm text-muted-foreground">{t('calculation.noCalculation')}</p>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('calculation.heirName')}</TableHead>
                          <TableHead className="hidden sm:table-cell">{t('calculation.relationship')}</TableHead>
                          <TableHead className="text-center">{t('calculation.fraction')}</TableHead>
                          <TableHead className="text-center">%</TableHead>
                          <TableHead className="text-end">{t('calculation.amount')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.heirs.map(h => (
                          <TableRow key={h.heir_id}>
                            <TableCell className="font-medium">{h.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{t(`heir.relationships.${h.relationship}`)}</TableCell>
                            <TableCell className="text-center font-mono text-xs sm:text-sm">{h.fraction}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{h.percentage}%</TableCell>
                            <TableCell className="text-end font-bold whitespace-nowrap">{t('common.currency')}{h.amount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-medium text-sm sm:text-base">{t('calculation.totalDistributed')}</span>
                    <span className="font-bold text-base sm:text-lg">{t('common.currency')}{result.total_distributed.toLocaleString()}</span>
                  </div>
                  {result.remainder > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('calculation.remainder')}</span>
                      <span className="text-muted-foreground">{t('common.currency')}{result.remainder.toLocaleString()}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
