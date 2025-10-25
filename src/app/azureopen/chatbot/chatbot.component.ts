import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AzureOpenAIService } from "../azure-openai.service";
import { Component } from "@angular/core";
import { MarkdownModule } from "ngx-markdown";

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string; // Agregar timestamp opcional
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  chatHistory: ChatMessage[] = [];
  userMessage: string = '';
  loading: boolean = false;

  constructor(private azureService: AzureOpenAIService) {}

  sendMessage(): void {
    if (!this.userMessage.trim() || this.loading) return;

    const message = this.userMessage.trim();
    
    // Agregar mensaje del usuario
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: this.getCurrentTime()
    });

    this.userMessage = '';
    this.loading = true;

    // Llamar al servicio de Azure OpenAI
    this.azureService.sendMessage(message).subscribe({
      next: (response) => {
        this.chatHistory.push({
          role: 'assistant',
          content: response,
          timestamp: this.getCurrentTime()
        });
        this.loading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error al comunicarse con Azure OpenAI:', error);
        this.chatHistory.push({
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
          timestamp: this.getCurrentTime()
        });
        this.loading = false;
      }
    });
  }

  handleKey(event: KeyboardEvent) {
  // Si presiona Enter y no está con Shift
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // evita salto de línea
    this.sendMessage();
  }
}

  // Método para enviar sugerencias rápidas
  sendSuggestion(suggestion: string): void {
    this.userMessage = suggestion;
    this.sendMessage();
  }

  // Obtener hora actual formateada
  private getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Scroll automático al último mensaje
  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('main');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
