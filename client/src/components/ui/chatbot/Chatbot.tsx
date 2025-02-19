
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '../button';
import { Card } from '../card';
import { Input } from '../input';

interface Message {
  content: string;
  isUser: boolean;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { content: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { content: data.response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { content: "Sorry, I couldn't process your request.", isUser: false }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Financial Advisor</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
