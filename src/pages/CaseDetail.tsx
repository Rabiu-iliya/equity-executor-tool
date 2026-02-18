import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCase, updateCase, getHeirs, addHeir, deleteHeir, getAssets, addAsset, deleteAsset } from '@/lib/store';
import { calculateFaraid } from '@/lib/faraid';
import { InheritanceCase, Heir, Asset, HeirRelationship, AssetType, FaraidResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, Calculator, Users, Landmark, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (!id) return;
    const c = getCase(id);
    if (!c) { navigate('/'); return; }
    setCaseData(c);
    setHeirs(getHeirs(id));
    setAssets(getAssets(id));
  }, [id, navigate]);

  const totalAssetValue = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);

  const handleAddHeir = () => {
    if (!id || !newHeir.name) return;
    addHeir({ case_id: id, ...newHeir });
    setHeirs(getHeirs(id));
    setNewHeir({ name: '', relationship: 'son' });
  };

  const handleRemoveHeir = (heirId: string) => {
    deleteHeir(heirId);
    if (id) setHeirs(getHeirs(id));
  };

  const handleAddAsset = () => {
    if (!id || !newAsset.description || newAsset.value <= 0) return;
    addAsset({ case_id: id, ...newAsset });
    setAssets(getAssets(id));
    setNewAsset({ type: 'money', description: '', value: 0 });
  };

  const handleRemoveAsset = (assetId: string) => {
    deleteAsset(assetId);
    if (id) setAssets(getAssets(id));
  };

  const handleCalculate = () => {
    if (!caseData || heirs.length === 0) return;
    const estate = totalAssetValue > 0 ? totalAssetValue : caseData.total_estate;
    const r = calculateFaraid(heirs, estate);
    setResult(r);
    if (id) {
      updateCase(id, { status: 'calculated', total_estate: estate });
      setCaseData(getCase(id) || null);
    }
  };

  if (!caseData) return null;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">{caseData.deceased_name}</h1>
          <p className="text-sm text-muted-foreground">{caseData.deceased_date}</p>
        </div>
        <Badge className="ml-auto">{t(`dashboard.${caseData.status}`)}</Badge>
      </div>

      <Tabs defaultValue="heirs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heirs"><Users className="mr-1 h-4 w-4" />{t('heir.title')}</TabsTrigger>
          <TabsTrigger value="assets"><Landmark className="mr-1 h-4 w-4" />{t('asset.title')}</TabsTrigger>
          <TabsTrigger value="calculation"><PieChart className="mr-1 h-4 w-4" />{t('calculation.title')}</TabsTrigger>
        </TabsList>

        {/* HEIRS TAB */}
        <TabsContent value="heirs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{t('heir.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder={t('heir.name')} value={newHeir.name} onChange={e => setNewHeir({ ...newHeir, name: e.target.value })} className="flex-1" />
                <Select value={newHeir.relationship} onValueChange={(v) => setNewHeir({ ...newHeir, relationship: v as HeirRelationship })}>
                  <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map(r => (
                      <SelectItem key={r} value={r}>{t(`heir.relationships.${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddHeir}><Plus className="mr-1 h-4 w-4" />{t('heir.add')}</Button>
              </div>

              {heirs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('heir.noHeirs')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('heir.name')}</TableHead>
                      <TableHead>{t('heir.relationship')}</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSETS TAB */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />{t('asset.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={newAsset.type} onValueChange={(v) => setNewAsset({ ...newAsset, type: v as AssetType })}>
                  <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(t2 => (
                      <SelectItem key={t2} value={t2}>{t(`asset.types.${t2}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder={t('asset.description')} value={newAsset.description} onChange={e => setNewAsset({ ...newAsset, description: e.target.value })} className="flex-1" />
                <Input type="number" placeholder={t('asset.value')} min="0" step="0.01" value={newAsset.value || ''} onChange={e => setNewAsset({ ...newAsset, value: parseFloat(e.target.value) || 0 })} className="w-full sm:w-[150px]" />
                <Button onClick={handleAddAsset}><Plus className="mr-1 h-4 w-4" />{t('asset.add')}</Button>
              </div>

              {assets.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('asset.noAssets')}</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('asset.type')}</TableHead>
                        <TableHead>{t('asset.description')}</TableHead>
                        <TableHead className="text-right">{t('asset.value')}</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map(a => (
                        <TableRow key={a.id}>
                          <TableCell><Badge variant="outline">{t(`asset.types.${a.type}`)}</Badge></TableCell>
                          <TableCell>{a.description}</TableCell>
                          <TableCell className="text-right font-medium">{t('common.currency')}{a.value.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveAsset(a.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end">
                    <p className="text-lg font-bold">{t('asset.totalValue')}: {t('common.currency')}{totalAssetValue.toLocaleString()}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALCULATION TAB */}
        <TabsContent value="calculation">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />{t('calculation.title')}</CardTitle>
                <Button onClick={handleCalculate} disabled={heirs.length === 0}>
                  <Calculator className="mr-1 h-4 w-4" />
                  {result ? t('case.recalculate') : t('case.calculate')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <p className="text-center py-12 text-muted-foreground">{t('calculation.noCalculation')}</p>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('calculation.heirName')}</TableHead>
                        <TableHead>{t('calculation.relationship')}</TableHead>
                        <TableHead className="text-center">{t('calculation.fraction')}</TableHead>
                        <TableHead className="text-center">{t('calculation.percentage')}</TableHead>
                        <TableHead className="text-right">{t('calculation.amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.heirs.map(h => (
                        <TableRow key={h.heir_id}>
                          <TableCell className="font-medium">{h.name}</TableCell>
                          <TableCell>{t(`heir.relationships.${h.relationship}`)}</TableCell>
                          <TableCell className="text-center font-mono">{h.fraction}</TableCell>
                          <TableCell className="text-center">{h.percentage}%</TableCell>
                          <TableCell className="text-right font-bold">{t('common.currency')}{h.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-medium">{t('calculation.totalDistributed')}</span>
                    <span className="font-bold text-lg">{t('common.currency')}{result.total_distributed.toLocaleString()}</span>
                  </div>
                  {result.remainder > 0 && (
                    <div className="flex justify-between">
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
