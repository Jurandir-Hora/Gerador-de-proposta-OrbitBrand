import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
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
  Cloud,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  Plus
} from 'lucide-react';
import { Template } from '../types';

export const Templates: React.FC = () => {
  const { templates, addProposal, isSyncingTemplates, deleteTemplate, updateTemplate, addTemplate } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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
        navigate(`/editor/${newId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao criar proposta baseada no template.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este template? Todos os usuários não o verão mais.")) {
      try {
        await deleteTemplate(id);
      } catch (error) {
        alert("Erro ao excluir o template.");
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    setEditingTemplate(template);
  };

  const handleSaveModal = async (updatedData: Partial<Template>) => {
    try {
      if (isCreatingNew) {
        await addTemplate(updatedData as Omit<Template, 'id'>);
        setIsCreatingNew(false);
      } else if (editingTemplate) {
        await updateTemplate(editingTemplate.id, updatedData);
        setEditingTemplate(null);
      }
    } catch (error) {
      alert("Erro ao salvar o template.");
    }
  };

  return (
    <div className="space-y-6 text-neutral-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Criar Proposta</h2>
          <p className="text-neutral-500 mt-1 font-medium italic">Escolha um modelo de proposta e comece a personalizá-lo para seu cliente.</p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'master' && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center focus:outline-none justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Novo</span>
            </button>
          )}

          {isSyncingTemplates && (
            <div className="flex items-center gap-3 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl border border-indigo-100 animate-pulse shadow-sm">
              <Cloud className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando com a Nuvem...</span>
              <RefreshCw className="w-3 h-3 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => !creating && handleUseTemplate(template.id)}
            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-black transition-all cursor-pointer flex flex-col h-full group active:scale-[0.98] relative"
          >
            {user?.role === 'master' && (
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEdit(e, template)}
                  title="Editar Template"
                  className="p-2 bg-white/90 backdrop-blur text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full shadow-sm transition-colors border border-black/5"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, template.id)}
                  title="Excluir Template"
                  className="p-2 bg-white/90 backdrop-blur text-red-500 hover:text-white hover:bg-red-600 rounded-full shadow-sm transition-colors border border-black/5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="p-8 flex-1 flex flex-col pt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-neutral-50 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  {getIconForCategory(template.category)}
                </div>
                <span className="px-3 py-1 bg-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-500 rounded-full truncate max-w-[140px]">
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

      {(editingTemplate || isCreatingNew) && (
        <EditTemplateModal
          template={editingTemplate || {
            name: '',
            category: 'Geral',
            description: '',
            defaultTerms: '',
            defaultServices: []
          } as any}
          onClose={() => {
            setEditingTemplate(null);
            setIsCreatingNew(false);
          }}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};

const EditTemplateModal = ({ template, onClose, onSave }: { template: Template, onClose: () => void, onSave: (updated: Partial<Template>) => void }) => {
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [description, setDescription] = useState(template.description);
  const [defaultTerms, setDefaultTerms] = useState(template.defaultTerms || '');
  const [services, setServices] = useState(template.defaultServices.map(s => ({ ...s })));

  const handleSave = () => {
    onSave({
      name,
      category,
      description,
      defaultTerms,
      defaultServices: services
    });
  };

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', price: 0, quantity: 1, description: '' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, key: string, value: any) => {
    const nextServices = [...services];
    nextServices[index] = { ...nextServices[index], [key]: value };
    setServices(nextServices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10">
          <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">{template.name ? 'Editar Template' : 'Criar Template'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Nome do Template</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-bold text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-bold text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium text-neutral-900 resize-none text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Termos Padrão</label>
                <textarea
                  rows={4}
                  value={defaultTerms}
                  onChange={e => setDefaultTerms(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-medium text-neutral-900 resize-none text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-full max-h-[500px]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400">Serviços Padrão</label>
                <button onClick={addService} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors p-1">
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2 flex-1 pb-4">
                {services.map((srv, idx) => (
                  <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 relative group">
                    <button
                      onClick={() => removeService(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                      title="Remover serviço"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nome do Serviço"
                        value={srv.name}
                        onChange={e => updateService(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Descrição (Opcional)"
                        value={srv.description || ''}
                        onChange={e => updateService(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs text-neutral-600"
                      />
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-bold">R$</span>
                          <input
                            type="number"
                            placeholder="0,00"
                            value={srv.price}
                            onChange={e => updateService(idx, 'price', Number(e.target.value))}
                            className="w-full pl-8 pr-3 py-2 bg-white rounded-lg border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-bold"
                          />
                        </div>
                        <div className="w-24 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-black uppercase">Qtd</span>
                          <input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={srv.quantity || 1}
                            onChange={e => updateService(idx, 'quantity', Number(e.target.value))}
                            className="w-full pl-10 pr-3 py-2 bg-white rounded-lg border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="text-center py-8 text-sm text-neutral-500 italic font-medium bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    Nenhum serviço incluído.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/5 bg-neutral-50 flex justify-end gap-3 rounded-b-[2rem]">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-white bg-black hover:bg-neutral-800 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
