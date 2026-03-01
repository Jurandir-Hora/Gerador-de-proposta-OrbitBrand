import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Analytics: React.FC = () => {
  const { proposals } = useAppContext();

  // Generate mock data for the last 7 days based on actual proposals
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayProposals = proposals.filter(p => p.createdAt && typeof p.createdAt === 'string' && p.createdAt.startsWith(dateStr));
      const views = dayProposals.reduce((sum, p) => sum + (p.views || 0), 0);
      const value = dayProposals.reduce((sum, p) => sum + (p.total || 0), 0);

      data.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        propostas: dayProposals.length,
        visualizacoes: views + Math.floor(Math.random() * 5), // Mock some views
        valor: value
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const totalValue = proposals.reduce((acc, p) => p.status === 'approved' ? acc + p.total : acc, 0);
  const totalSentValue = proposals.reduce((acc, p) => p.status === 'sent' ? acc + p.total : acc, 0);
  const conversionRate = proposals.length > 0
    ? ((proposals.filter(p => p.status === 'approved').length / proposals.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Análise de Performance</h2>
        <p className="text-neutral-500 mt-1">Acompanhe métricas, conversões e faturamento das suas propostas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500 mb-1">Faturamento Aprovado</p>
          <p className="text-3xl font-black text-green-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500 mb-1">Propostas Pendentes (Valor)</p>
          <p className="text-3xl font-black text-yellow-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSentValue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500 mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-black text-blue-600">{conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Views & Proposals */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Visualizações vs Criações (Últimos 7 dias)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="visualizacoes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" name="Visualizações" />
                <Area type="monotone" dataKey="propostas" stroke="#10b981" fillOpacity={1} fill="url(#colorProps)" name="Novas Propostas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Value */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">Valor em Propostas (Últimos 7 dias)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)}
                  contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="valor" fill="#000000" radius={[4, 4, 0, 0]} name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
