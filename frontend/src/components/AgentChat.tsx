import { useState, useEffect, useRef } from 'react';
import { AGENTS } from '../lib/agentPersonalities';
import { MARKETING_FLOW, ConversationStep } from '../lib/ConversationFlow';
import { ButtonPrimary, ButtonSecondary, Card } from './ui/DesignSystem'; // Tu sistema existente

interface AgentChatProps {
    area: 'marketing' | 'finanzas' | 'logistica' | 'operaciones';
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AgentChat({ area, userName, isOpen, onClose }: AgentChatProps) {
    const agent = AGENTS[area];
    const flow = area === 'marketing' ? MARKETING_FLOW : [];

    const [stepIndex, setStepIndex] = useState(0);
    const [messages, setMessages] = useState<{ from: 'bot' | 'user', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showActions, setShowActions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Iniciar conversación al abrir
    useEffect(() => {
        if (isOpen && messages.length === 0 && flow.length > 0) {
            addBotMessage(`¡Hola ${userName}! ${agent.name.toLowerCase()} aquí. ${agent.systemPrompt.split('.')[0]}. ¿Empezamos?`);
            setTimeout(() => {
                addBotMessage(flow[0].question);
            }, 1200);
        }
    }, [isOpen]);

    // Scroll automático al final
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const addBotMessage = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'bot', text }]);
            setIsTyping(false);
        }, 1000);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        // 1. Agregar mensaje del usuario
        setMessages(prev => [...prev, { from: 'user', text: input }]);
        setInput('');

        // 2. Mostrar botones de acción contextual
        const currentStep = flow[stepIndex];
        if (currentStep?.contextualActions) {
            setShowActions(currentStep.contextualActions);
        }

        // 3. Avanzar al siguiente paso (Aquí luego conectaremos tu gemini.ts para respuestas dinámicas)
        setTimeout(() => {
            if (stepIndex + 1 < flow.length) {
                setStepIndex(stepIndex + 1);
                addBotMessage(flow[stepIndex + 1].question);
            } else {
                addBotMessage('¡Increíble! Tengo todo lo que necesito. Cuando quieras, aprieta el botón "¡Estoy listo!" en tu tablero para generar tu landing con toda esta información.');
            }
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-md h-[600px] flex flex-col overflow-hidden border-0 shadow-2xl p-0">

                {/* Header con la "Oficina" de la mascota */}
                <div className={`bg-gradient-to-br ${agent.colorClass} p-6 flex items-center justify-between border-b border-white/50`}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-md animate-float">
                            {agent.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{agent.name}</h3>
                            <p className="text-xs text-gray-600 font-medium">Tu guía de {agent.area}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-light transition-colors">×</button>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.from === 'user'
                                    ? 'bg-gray-900 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Botones de Acción Contextual (ej: Grabar video) */}
                {showActions.length > 0 && (
                    <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex gap-2 overflow-x-auto">
                        {showActions.map((action, i) => (
                            <button key={i} className="whitespace-nowrap px-4 py-2 bg-white border border-amber-200 rounded-full text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-1">
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu respuesta..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-300 transition-colors text-sm"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-gray-900 text-white rounded-2xl px-5 py-3 hover:bg-gray-800 transition-all active:scale-95"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}