import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, MousePointer } from 'lucide-react';
import { Button } from '../button';
import { Card } from '../card';
import { Input } from '../input';

interface Message {
  content: string;
  isUser: boolean;
}

export function Chatbot({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Create and add highlight styles
    const style = document.createElement('style');
    style.innerHTML = `
      .chatbot-highlight {
        animation: pulse 2s infinite;
        outline: 3px solid #0066ff !important;
        position: relative;
        z-index: 1000;
      }
      @keyframes pulse {
        0% { outline-offset: 0px; }
        50% { outline-offset: 5px; }
        100% { outline-offset: 0px; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleElementSelect = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.target as Element;
    if (target) {
      setSelectedElement(target);
      setIsSelecting(false);
      setInput(`Selected element content: ${target.textContent?.trim()}`);

      // Remove highlight from all elements
      document.querySelectorAll('.chatbot-highlight').forEach(el => {
        el.classList.remove('chatbot-highlight');
      });
    }
  };

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('click', handleElementSelect);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleElementSelect);
      document.body.style.cursor = 'default';
    }

    return () => {
      document.removeEventListener('click', handleElementSelect);
      document.body.style.cursor = 'default';
    };
  }, [isSelecting]);

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
        body: JSON.stringify({ 
          message: input,
          selectedContent: selectedElement?.textContent || null
        }),
      });

      const data = await response.json();

      // Handle element highlighting if response contains highlight instructions
      if (data.highlightSelector) {
        document.querySelectorAll('.chatbot-highlight').forEach(el => {
          el.classList.remove('chatbot-highlight');
        });
        try {
          const elementToHighlight = document.querySelector(data.highlightSelector);
          if (elementToHighlight) {
            elementToHighlight.classList.add('chatbot-highlight');
            elementToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (err) {
          console.error('Invalid selector:', data.highlightSelector);
        }
      }

      setMessages(prev => [...prev, { content: data.response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { content: "Sorry, I couldn't process your request.", isUser: false }]);
    }

    setSelectedElement(null);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className || ''}`}>
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
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSelecting(!isSelecting)}
                className={isSelecting ? 'bg-primary text-primary-foreground' : ''}
              >
                <MousePointer className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
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
                placeholder={isSelecting ? "Click an element on the page..." : "Ask me anything..."}
                className="flex-1"
                disabled={isSelecting}
              />
              <Button type="submit" size="icon" disabled={isSelecting}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}