import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface Message {
  role: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureOpenAIService {
  private endpoint = 'https://openai-santa-2025.openai.azure.com/';
  private deployment = 'gpt-4o';
  private apiVersion = '2024-08-01-preview';
  private apiKey = 'st4bvsy24RGJFZPeiokJn8F2dUpLNGfbUlff58kDi9H0uI7zxAOwJQQJ99BJACYeBjFXJ3w3AAABACOG7Atq';
  
  // Mantener historial de conversación
  private conversationHistory: Message[] = [
    {
      role: 'system',
      content: 'Eres un asistente virtual de la Municipalidad Distrital de Santa. Respondes de forma clara, amable y profesional sobre trámites municipales, horarios, documentos y servicios.'
    }
  ];

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    const url = `${this.endpoint}openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': this.apiKey
    });

    // Agregar mensaje del usuario al historial
    this.conversationHistory.push({ role: 'user', content: message });

    const body = {
      messages: this.conversationHistory,
      temperature: 0.7,
      max_tokens: 800
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map((res) => {
        const responseContent = res?.choices?.[0]?.message?.content ?? 'No se recibió respuesta.';
        
        // Agregar respuesta del asistente al historial
        this.conversationHistory.push({
          role: 'assistant',
          content: responseContent
        });

        return responseContent;
      })
    );
  }

  // Método para limpiar el historial si es necesario
  clearHistory(): void {
    this.conversationHistory = [
      {
        role: 'system',
        content: 'Eres un asistente virtual de la Municipalidad Distrital de Santa. Respondes de forma clara, amable y profesional sobre trámites municipales, horarios, documentos y servicios.'
      }
    ];
  }
}
