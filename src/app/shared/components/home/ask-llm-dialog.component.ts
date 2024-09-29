import { Component } from '@angular/core'; 
import { MatDialogRef } from '@angular/material/dialog'; 
import { AskLLMDialogService } from './services/ask-llm-dialog';
 
@Component({ 
  selector: 'app-ask-llm-dialog', 
  templateUrl: './ask-llm-dialog.component.html', 
  styleUrls: ['./ask-llm-dialog.component.less'], 
}) 
export class AskLLMDialogComponent { 
  userQuery: string = ''; 
  chatMessages: {type: string, text: string}[] = []; 
  searchTerm = ''; 
  initialMessage: {type: string, text: string} = {type: 'bot', text: 'Не знаешь, что выбрать? Спроси у Rutube AI. Для этого просто введи запрос, что хочешь посмотреть'};

  constructor( 
    public dialogRef: MatDialogRef<AskLLMDialogComponent>, 
    private _AskLLMDialogService: AskLLMDialogService
  ) { 
    this.chatMessages.push(this.initialMessage); 

  } 

  onSearch(): void { 
    if (this.searchTerm.trim() === '') { 
      return; 
    } 

    // Добавляем сообщение пользователя
    this.chatMessages.push({type: 'user', text: this.searchTerm}); 
    const userKey = localStorage.getItem('userKey');
    this._AskLLMDialogService.askLLMDialog(this.searchTerm, userKey).subscribe({
      next: (response) => {
        if (response) {
          const answer = response; 
          this.chatMessages.push({type: 'bot', text: answer.predict});
        } 
      },
      error: (err) => {
        this.chatMessages.push({type: 'bot', text: 'Произошла ошибка. Попробуйте еще раз.'});
      }
    });

    this.searchTerm = '';
  } 

  formatMessage(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }

  onCancel(): void { 
    this.dialogRef.close(); 
  } 
}