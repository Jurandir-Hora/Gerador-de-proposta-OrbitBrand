import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import {
    UserPlus,
    Shield,
    User,
    Settings,
    Mail,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    X,
    LayoutTemplate,
    PlusSquare,
    PlusCircle,
    Video,
    Play,
    Layout,
    Camera,
    Briefcase,
    FileText,
    TrendingUp,
    Users,
    Search,
    Wind,
    Radio,
    Zap,
    Diamond,
    Mic,
    Home,
    PenTool,
    Type,
    Star,
    RotateCcw,
    Palette,
    Smartphone,
    Building2,
    Globe,
    ChevronUp,
    ChevronDown,
    SortAsc,
    CreditCard,
    QrCode
} from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'master' | 'admin' | 'manager' | 'collaborator';
    password?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    avatarUrl?: string;
}

export const UserManagement: React.FC = () => {
    const { user: currentUser, updateUser: updateAuthUser } = useAuth();
    const {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        reorderTemplates,
        deduplicateTemplates,
        restoreTemplates,
        agencySettings,
        updateAgencySettings
    } = useAppContext();
    const [activeTab, setActiveTab] = useState<'team' | 'templates' | 'visual'>('team');

    // Estados da Equipe
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'collaborator' as TeamMember['role'],
        avatarUrl: ''
    });

    // Estados dos Templates
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [templateFormData, setTemplateFormData] = useState({
        name: '',
        category: 'Filmmaking',
        description: '',
        defaultTerms: '',
        defaultServices: [] as any[]
    });

    const [users, setUsers] = useState<TeamMember[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const usersList: TeamMember[] = [];
            querySnapshot.forEach((doc) => {
                usersList.push(doc.data() as TeamMember);
            });
            setUsers(usersList);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (currentUser?.role !== 'master') {
        return (
            <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-neutral-100 font-bold text-neutral-900 uppercase">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                Acesso Restrito
            </div>
        );
    }

    // Handlers Equipe
    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Atualiza no Firestore
                const userRef = doc(db, 'users', editingUser.id);
                const updatedData = {
                    name: userFormData.name,
                    email: userFormData.email,
                    role: userFormData.role,
                    avatarUrl: userFormData.avatarUrl
                };
                await updateDoc(userRef, updatedData);

                // Se for o próprio usuário logado, atualiza o AuthContext
                if (currentUser?.id === editingUser.id) {
                    await updateAuthUser({ name: userFormData.name, avatarUrl: userFormData.avatarUrl });
                }

                alert('Usuário atualizado com sucesso!');
            } else {
                // Para criar novos usuários, o Firestore por si só não cria a conta no Firebase Auth.
                // Mas podemos salvar o "Perfil" planejado. 
                // Idealmente o usuário deve se registrar por conta própria.
                alert('Atenção: Por segurança, novos integrantes devem criar suas próprias contas no sistema usando o e-mail convidado. Após o primeiro login deles, você poderá gerenciar as permissões aqui.');
                return;
            }
            fetchUsers();
            resetUserForm();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            alert('Erro ao processar alteração.');
        }
    };

    const handleEditUser = (u: TeamMember) => {
        setEditingUser(u);
        setUserFormData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role,
            avatarUrl: u.avatarUrl || ''
        });
        setIsAddingUser(true);
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (id === currentUser?.id) {
            alert("Você não pode excluir seu próprio usuário master.");
            return;
        }
        if (window.confirm(`Remover as permissões do integrante "${email}"? Isso não apaga a conta dele do Firebase, mas remove seu perfil do sistema Orbit.`)) {
            try {
                await deleteDoc(doc(db, 'users', id));
                fetchUsers();
            } catch (error) {
                alert('Erro ao remover usuário.');
            }
        }
    };

    const resetUserForm = () => {
        setIsAddingUser(false);
        setEditingUser(null);
        setUserFormData({ name: '', email: '', password: '', role: 'collaborator', avatarUrl: '' });
    };

    // Handlers Templates
    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, templateFormData);
                alert('Template atualizado!');
            } else {
                await addTemplate(templateFormData);
                alert('Template criado com sucesso!');
            }
            resetTemplateForm();
        } catch (error) {
            alert('Erro ao salvar template.');
        }
    };

    const handleEditTemplate = (t: any) => {
        setEditingTemplate(t);
        setTemplateFormData({
            name: t.name,
            category: t.category,
            description: t.description,
            defaultTerms: t.defaultTerms,
            defaultServices: t.defaultServices
        });
        setIsAddingTemplate(true);
    };

    const handleDeleteTemplate = async (id: string, name: string) => {
        if (window.confirm(`Excluir template "${name}" permanentemente?`)) {
            try {
                await deleteTemplate(id);
            } catch (error) {
                alert('Erro ao excluir template.');
            }
        }
    };

    const resetTemplateForm = () => {
        setIsAddingTemplate(false);
        setEditingTemplate(null);
        setTemplateFormData({
            name: '',
            category: 'Filmmaking',
            description: '',
            defaultTerms: '',
            defaultServices: []
        });
    };

    const handleSortTemplatesAlphabetically = async () => {
        const sorted = [...templates].sort((a, b) => a.name.localeCompare(b.name));
        await reorderTemplates(sorted);
        alert('Biblioteca organizada por ordem alfabética!');
    };

    const handleMoveTemplate = async (index: number, direction: 'up' | 'down') => {
        const newTemplates = [...templates];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newTemplates.length) return;

        [newTemplates[index], newTemplates[targetIndex]] = [newTemplates[targetIndex], newTemplates[index]];
        await reorderTemplates(newTemplates);
    };

    const addServiceToTemplate = () => {
        setTemplateFormData({
            ...templateFormData,
            defaultServices: [...templateFormData.defaultServices, { id: Date.now().toString(), name: '', price: 0, quantity: 1 }]
        });
    };

    const removeServiceFromTemplate = (id: string) => {
        setTemplateFormData({
            ...templateFormData,
            defaultServices: templateFormData.defaultServices.filter(s => s.id !== id)
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'master': return <Shield className="w-4 h-4 text-orange-500" />;
            case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
            case 'manager': return <Settings className="w-4 h-4 text-green-500" />;
            default: return <User className="w-4 h-4 text-neutral-400" />;
        }
    };

    const getTemplateIcon = (category: string) => {
        switch (category) {
            case 'Filmmaking': return <Video className="w-6 h-6 text-indigo-500" />;
            case 'Tráfego Pago (Ads)': return <TrendingUp className="w-6 h-6 text-green-500" />;
            case 'Consultoria de Conteúdo': return <Users className="w-6 h-6 text-blue-500" />;
            case 'SEO': return <Search className="w-6 h-6 text-orange-500" />;
            case 'Captação com Drone': return <Wind className="w-6 h-6 text-sky-500" />;
            case 'Transmissão ao Vivo': return <Radio className="w-6 h-6 text-rose-500" />;
            case 'Motion Graphics': return <Zap className="w-6 h-6 text-amber-500" />;
            case 'Conteúdo para Branding': return <Diamond className="w-6 h-6 text-purple-500" />;
            case 'Ativações': return <Camera className="w-6 h-6 text-red-500" />;
            case 'Event Tech': return <Mic className="w-6 h-6 text-neutral-500" />;
            case 'Cenografia': return <Home className="w-6 h-6 text-emerald-500" />;
            case 'Identidade Visual': return <PenTool className="w-6 h-6 text-indigo-500" />;
            case 'Redação (Copywriting)': return <Type className="w-6 h-6 text-neutral-400" />;
            case 'Influência': return <Star className="w-6 h-6 text-yellow-500" />;
            default: return <Briefcase className="w-6 h-6 text-neutral-400" />;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8 text-neutral-300" />
                    Configurações
                </h2>
            </div>

            <div className="flex space-x-1 bg-neutral-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}`}
                >
                    <User className="w-4 h-4" />
                    Equipe
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}`}
                >
                    <LayoutTemplate className="w-4 h-4" />
                    Biblioteca
                </button>
                <button
                    onClick={() => setActiveTab('visual')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'visual' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}`}
                >
                    <Palette className="w-4 h-4" />
                    Identidade
                </button>
            </div>

            {activeTab === 'team' ? (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase text-neutral-900">Gestão de Integrantes</h3>
                        {!isAddingUser && (
                            <button onClick={() => setIsAddingUser(true)} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm">
                                <UserPlus className="w-4 h-4" /> Novo Membro
                            </button>
                        )}
                    </div>

                    {isAddingUser && (
                        <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl">
                            <form onSubmit={handleSaveUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Nome Completo</label>
                                        <input type="text" required value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">E-mail</label>
                                        <input type="email" required value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Senha</label>
                                        <input type="password" placeholder={editingUser ? "Deixe em branco para não alterar" : "Senha de acesso"} required={!editingUser} value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Cargo / Permissão</label>
                                        <select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value as TeamMember['role'] })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold uppercase text-xs">
                                            <option value="collaborator">Colaborador</option>
                                            <option value="manager">Gerente</option>
                                            <option value="admin">Administrador</option>
                                            <option value="master">Master</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Avatar URL (Link da Imagem)</label>
                                        <input type="text" value={userFormData.avatarUrl} onChange={e => setUserFormData({ ...userFormData, avatarUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200" placeholder="https://exemplo.com/avatar.jpg" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="bg-black text-white px-10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salvar</button>
                                    <button type="button" onClick={resetUserForm} className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-900">
                                <tr className="text-[10px] uppercase font-black tracking-widest text-neutral-500">
                                    <th className="px-8 py-4">Usuário</th>
                                    <th className="px-8 py-4">Cargo</th>
                                    <th className="px-8 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {loadingUsers ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center text-neutral-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                                            Sincronizando equipe com a nuvem...
                                        </td>
                                    </tr>
                                ) : users.length > 0 ? (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-neutral-50 group transition-colors">
                                            <td className="px-8 py-6 flex items-center gap-4">
                                                {u.avatarUrl ? (
                                                    <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-black text-xs uppercase">{u.name.substring(0, 2)}</div>
                                                )}
                                                <div>
                                                    <p className="font-black text-neutral-900 text-sm leading-none mb-1">{u.name}</p>
                                                    <p className="text-xs text-neutral-400">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1 rounded-full w-fit">
                                                    {getRoleIcon(u.role)}
                                                    <span className="text-[9px] font-black uppercase">{u.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleEditUser(u)} className="p-2 text-neutral-400 hover:text-black"><Edit2 className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-2 text-neutral-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center text-neutral-400">
                                            Nenhum usuário encontrado no sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'visual' ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-neutral-900 rounded-2xl">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase text-neutral-900">Identidade da Agência</h3>
                                <p className="text-neutral-500 text-sm">Estas informações aparecerão no cabeçalho e rodapé das propostas e do PDF.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Informações da Marca</h4>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Nome da Agência</label>
                                    <input
                                        type="text"
                                        value={agencySettings.agencyName}
                                        onChange={e => updateAgencySettings({ agencyName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="Ex: Orbit Brand Agência"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Título do Documento</label>
                                    <input
                                        type="text"
                                        value={agencySettings.proposalTitle}
                                        onChange={e => updateAgencySettings({ proposalTitle: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="Ex: Proposta Comercial"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">CNPJ / CPF</label>
                                    <input
                                        type="text"
                                        value={agencySettings.cnpj}
                                        onChange={e => updateAgencySettings({ cnpj: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="00.000.000/0001-00 ou CPF"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">URL da Logomarca (PNG/JPG)</label>
                                    <input
                                        type="text"
                                        value={agencySettings.logoUrl || ''}
                                        onChange={e => updateAgencySettings({ logoUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="https://sua-logo.com/imagem.png"
                                    />
                                    <p className="text-[9px] text-neutral-400 mt-2 italic px-1">Dica: Se deixar vazio, usaremos o nome da agência por extenso.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Contato & Rodapé</h4>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">E-mail de Contato</label>
                                    <input
                                        type="email"
                                        value={agencySettings.email}
                                        onChange={e => updateAgencySettings({ email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="agencia@exemplo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Telefone/WhatsApp</label>
                                    <input
                                        type="text"
                                        value={agencySettings.phone}
                                        onChange={e => updateAgencySettings({ phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Mensagem de Rodapé (PDF)</label>
                                    <input
                                        type="text"
                                        value={agencySettings.footerText}
                                        onChange={e => updateAgencySettings({ footerText: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="Ex: Orbit Brand Agência - Proposta Comercial"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 border-b border-neutral-100 pb-2">Dados Bancários para Recebimento</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Banco</label>
                                        <input
                                            type="text"
                                            value={agencySettings.bankName || ''}
                                            onChange={e => updateAgencySettings({ bankName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="Ex: Nubank"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Chave PIX</label>
                                        <input
                                            type="text"
                                            value={agencySettings.pixKey || ''}
                                            onChange={e => updateAgencySettings({ pixKey: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="E-mail, CPF ou Aleatória"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Agência</label>
                                        <input
                                            type="text"
                                            value={agencySettings.bankAgency || ''}
                                            onChange={e => updateAgencySettings({ bankAgency: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="0001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Conta</label>
                                        <input
                                            type="text"
                                            value={agencySettings.bankAccount || ''}
                                            onChange={e => updateAgencySettings({ bankAccount: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="123456-7"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5 ml-1">Endereço Físico / Sede</label>
                                <input
                                    type="text"
                                    value={agencySettings.address}
                                    onChange={e => updateAgencySettings({ address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                />
                                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <CreditCard className="w-6 h-6 text-neutral-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-neutral-400">Dados de Pagamento</p>
                                        <p className="text-xs text-neutral-600">Esses dados serão usados para gerar o QR Code PIX e as informações bancárias nos recibos oficiais.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
                        <div>
                            <h3 className="text-xl font-black uppercase text-indigo-900">Editor de Biblioteca</h3>
                            <p className="text-indigo-600 text-sm">Personalize os modelos de proposta da agência.</p>
                        </div>
                        <div className="flex gap-4">
                            {!isAddingTemplate && (
                                <>
                                    <button
                                        onClick={handleSortTemplatesAlphabetically}
                                        className="text-neutral-500 border border-neutral-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-50 transition-all"
                                        title="Ordenar por Nome"
                                    >
                                        <SortAsc className="w-4 h-4" /> A-Z
                                    </button>
                                    <button
                                        onClick={deduplicateTemplates}
                                        className="text-orange-500 border border-orange-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-orange-50 transition-all"
                                        title="Remover modelos com nomes repetidos"
                                    >
                                        <Trash2 className="w-4 h-4" /> Limpar Duplicados
                                    </button>
                                    <button
                                        onClick={restoreTemplates}
                                        className="text-neutral-500 border border-neutral-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-50 transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Restaurar Padrão
                                    </button>
                                    <button
                                        onClick={() => setIsAddingTemplate(true)}
                                        className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-sm shadow-xl"
                                    >
                                        <PlusSquare className="w-4 h-4" /> Criar Novo Template
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {isAddingTemplate && (
                        <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl animate-in zoom-in-95">
                            <form onSubmit={handleSaveTemplate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Nome do Template</label>
                                        <input type="text" required value={templateFormData.name} onChange={e => setTemplateFormData({ ...templateFormData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200" placeholder="Ex: Produção de Reel" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Categoria</label>
                                        <select value={templateFormData.category} onChange={e => setTemplateFormData({ ...templateFormData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold text-xs uppercase">
                                            <option value="Filmmaking">Filmmaking</option>
                                            <option value="Tráfego Pago (Ads)">Tráfego Pago (Ads)</option>
                                            <option value="Consultoria de Conteúdo">Consultoria de Conteúdo</option>
                                            <option value="SEO">SEO (Vídeos/Imagens)</option>
                                            <option value="Captação com Drone">Captação com Drone</option>
                                            <option value="Transmissão ao Vivo">Transmissão ao Vivo (Live)</option>
                                            <option value="Motion Graphics">Motion Graphics / Animação</option>
                                            <option value="Conteúdo para Branding">Conteúdo para Branding</option>
                                            <option value="Ativações">Ativações Foto/Vídeo</option>
                                            <option value="Event Tech">Sonorização / Iluminação</option>
                                            <option value="Cenografia">Cenografia</option>
                                            <option value="Identidade Visual">Identidade Visual</option>
                                            <option value="Redação (Copywriting)">Redação (Copywriting)</option>
                                            <option value="Influência">Consultoria de Influência</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                                    <textarea required value={templateFormData.description} onChange={e => setTemplateFormData({ ...templateFormData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 h-20" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Serviços Padrão</label>
                                        <button type="button" onClick={addServiceToTemplate} className="text-indigo-600 text-xs font-bold flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Add Serviço</button>
                                    </div>
                                    <div className="space-y-3">
                                        {templateFormData.defaultServices.map((service, idx) => (
                                            <div key={service.id} className="flex gap-3 items-end">
                                                <div className="flex-1">
                                                    <input type="text" placeholder="Nome" value={service.name} onChange={e => {
                                                        const newServices = [...templateFormData.defaultServices];
                                                        newServices[idx].name = e.target.value;
                                                        setTemplateFormData({ ...templateFormData, defaultServices: newServices });
                                                    }} className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" />
                                                </div>
                                                <div className="w-24 text-right">
                                                    <input type="number" placeholder="Preço" value={service.price} onChange={e => {
                                                        const newServices = [...templateFormData.defaultServices];
                                                        newServices[idx].price = Number(e.target.value);
                                                        setTemplateFormData({ ...templateFormData, defaultServices: newServices });
                                                    }} className="w-full px-3 py-2 rounded-lg border border-neutral-100 text-sm" />
                                                </div>
                                                <button type="button" onClick={() => removeServiceFromTemplate(service.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Termos e Condições Padrão</label>
                                    <textarea value={templateFormData.defaultTerms} onChange={e => setTemplateFormData({ ...templateFormData, defaultTerms: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 h-24 text-sm" placeholder="Ex: 50% de sinal e 50% na entrega..." />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="bg-black text-white px-10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salvar Template</button>
                                    <button type="button" onClick={resetTemplateForm} className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!isAddingTemplate && (
                            <div
                                onClick={() => setIsAddingTemplate(true)}
                                className="border-2 border-dashed border-neutral-200 rounded-3xl p-10 flex flex-col items-center justify-center text-neutral-300 hover:border-black hover:text-black transition-all cursor-pointer group bg-neutral-50/30"
                            >
                                <PlusCircle className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="font-black uppercase text-[10px] tracking-widest text-center">Adicionar Modelo<br />Customizado</p>
                            </div>
                        )}
                        {templates.map((t, index) => (
                            <div key={t.id} className="bg-white border border-neutral-200 rounded-3xl p-6 hover:shadow-xl transition-all group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-2">
                                        <div className="p-3 bg-neutral-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                            {getTemplateIcon(t.category)}
                                        </div>
                                        {/* Controles de Reordenação */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveTemplate(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-neutral-300 hover:text-black hover:bg-neutral-50 rounded-md transition-all disabled:opacity-0"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveTemplate(index, 'down')}
                                                disabled={index === templates.length - 1}
                                                className="p-1 text-neutral-300 hover:text-black hover:bg-neutral-50 rounded-md transition-all disabled:opacity-0"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEditTemplate(t)} className="p-2 text-neutral-400 hover:text-black transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteTemplate(t.id, t.name)} className="p-2 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h4 className="font-black text-neutral-900 mb-1 leading-tight">{t.name}</h4>
                                <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest mb-4 inline-block px-2 py-0.5 bg-neutral-50 rounded-md border border-neutral-100">{t.category}</p>
                                <p className="text-sm text-neutral-500 mb-6 line-clamp-2 leading-relaxed">{t.description}</p>
                                <div className="pt-4 border-t border-neutral-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-neutral-300 uppercase">{t.defaultServices.length} Serviços Base</span>
                                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 bg-neutral-900 rounded-3xl p-10 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Central de Controle Orbit Brand</h3>
                    <p className="text-neutral-400 leading-relaxed text-sm">
                        Este painel é exclusivo para usuários <strong>Master</strong>. Aqui você define quem entra na equipe e como a agência se apresenta para os clientes através dos templates oficiais.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </div>
        </div>
    );
};
