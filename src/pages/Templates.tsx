import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LayoutTemplate, PlusCircle, Play, Camera, Image as ImageIcon, Briefcase, Video } from 'lucide-react';

export const Templates: React.FC = () => {
  const { templates, addProposal } = useAppContext();
  const navigate = useNavigate();

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Filmmaking': return <Video className="w-8 h-8 text-indigo-500" />;
      case 'Mobile': return <Play className="w-8 h-8 text-rose-500" />;
      case 'Social Media': return <LayoutTemplate className="w-8 h-8 text-blue-500" />;
      case 'Photography': return <Camera className="w-8 h-8 text-emerald-500" />;
      case 'Eventos': return <Briefcase className="w-8 h-8 text-amber-500" />;
      default: return <ImageIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const total = template.defaultServices.reduce((acc, s) => acc + (s.price * s.quantity), 0);
    
    addProposal({
      clientName: 'Novo Cliente',
      clientEmail: '',
      projectName: `Proposta - ${template.name}`,
      status: 'draft',
      services: [...template.defaultServices],
      total,
      templateId,
      terms: template.defaultTerms,
      notes: '',
      media: [],
      timeline: []
    });

    // In a real app we would wait for the ID, but for our mock sync context 
    // it's added instantly, though we don't have the ID easily returned.
    // We can just navigate to proposals list.
    navigate('/proposals');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Biblioteca de Templates</h2>
        <p className="text-neutral-500 mt-1">Escolha um modelo de proposta e comece a personalizá-lo para seu cliente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  {getIconForCategory(template.category)}
                </div>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{template.name}</h3>
              <p className="text-neutral-500 text-sm flex-1">{template.description}</p>
              
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wider">Serviços Inclusos:</p>
                <ul className="space-y-2">
                  {template.defaultServices.map((service, idx) => (
                    <li key={idx} className="text-sm text-neutral-700 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 mr-2 shrink-0"></span>
                      <span>{service.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-neutral-50 border-t border-neutral-200">
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="w-full flex items-center justify-center space-x-2 bg-black hover:bg-neutral-800 text-white py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Usar Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
