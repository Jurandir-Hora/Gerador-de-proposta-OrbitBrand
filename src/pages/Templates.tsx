import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  LayoutTemplate,
  PlusCircle,
  Video,
  TrendingUp,
  Users,
  Search,
  Wind,
  Radio,
  Zap,
  Diamond,
  Camera,
  Mic,
  Home,
  PenTool,
  Type,
  Star,
  Briefcase,
  Image as ImageIcon,
  Cloud,
  RefreshCw
} from 'lucide-react';

export const Templates: React.FC = () => {
  const { templates, addProposal, isSyncingTemplates } = useAppContext();
  const navigate = useNavigate();
  // ... (omitting getIconForCategory for brevity in instructions, but keeping it in the file)

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Filmmaking': return <Video className="w-8 h-8 text-indigo-500" />;
      case 'Tráfego Pago (Ads)': return <TrendingUp className="w-8 h-8 text-green-500" />;
      case 'Consultoria de Conteúdo': return <Users className="w-8 h-8 text-blue-500" />;
      case 'SEO': return <Search className="w-8 h-8 text-orange-500" />;
      case 'Captação com Drone': return <Wind className="w-8 h-8 text-sky-500" />;
      case 'Transmissão ao Vivo': return <Radio className="w-8 h-8 text-rose-500" />;
      case 'Motion Graphics': return <Zap className="w-8 h-8 text-amber-500" />;
      case 'Conteúdo para Branding': return <Diamond className="w-8 h-8 text-purple-500" />;
      case 'Ativações': return <Camera className="w-8 h-8 text-red-500" />;
      case 'Event Tech': return <Mic className="w-8 h-8 text-neutral-500" />;
      case 'Cenografia': return <Home className="w-8 h-8 text-emerald-500" />;
      case 'Identidade Visual': return <PenTool className="w-8 h-8 text-indigo-500" />;
      case 'Redação (Copywriting)': return <Type className="w-8 h-8 text-neutral-400" />;
      case 'Influência': return <Star className="w-8 h-8 text-yellow-500" />;
      default: return <Briefcase className="w-8 h-8 text-neutral-400" />;
    }
  };

  const [creating, setCreating] = React.useState(false);

  const handleUseTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setCreating(true);
      const total = template.defaultServices.reduce((acc, s) => acc + (s.price * (s.quantity || 1)), 0);

      const newId = await addProposal({
        clientName: 'Novo Cliente',
        clientEmail: '',
        clientDocument: '',
        projectName: `Proposta - ${template.name}`,
        status: 'draft',
        services: [...template.defaultServices],
        total,
        templateId,
        terms: template.defaultTerms || '',
        notes: '',
        media: [],
        timeline: []
      });

      if (newId) {
        console.log("Redirecting to editor:", newId);
        navigate(`/editor/${newId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar proposta baseada no template.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 text-neutral-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Criar Proposta</h2>
          <p className="text-neutral-500 mt-1 font-medium italic">Escolha um modelo de proposta e comece a personalizá-lo para seu cliente.</p>
        </div>

        {isSyncingTemplates && (
          <div className="flex items-center gap-3 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl border border-indigo-100 animate-pulse shadow-sm">
            <Cloud className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando com a Nuvem...</span>
            <RefreshCw className="w-3 h-3 animate-spin" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => !creating && handleUseTemplate(template.id)}
            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-black transition-all cursor-pointer flex flex-col h-full group active:scale-[0.98]"
          >
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  {getIconForCategory(template.category)}
                </div>
                <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full">
                  {template.category}
                </span>
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-2 uppercase tracking-tight">{template.name}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed flex-1">{template.description}</p>

              <div className="mt-8 pt-6 border-t border-neutral-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Estrutura base</p>
                    <p className="text-sm font-bold text-neutral-700">{template.defaultServices.length} serviços inclusos</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
