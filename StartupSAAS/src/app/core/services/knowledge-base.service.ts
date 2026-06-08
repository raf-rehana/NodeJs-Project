import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface KnowledgeArticle {
  id?: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {
  private apiUrl = `${environment.apiUrl}/knowledgeBase`;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<KnowledgeArticle[]> {
    return this.http.get<KnowledgeArticle[]>(this.apiUrl);
  }

  getArticle(id: number): Observable<KnowledgeArticle> {
    return this.http.get<KnowledgeArticle>(`${this.apiUrl}/${id}`);
  }

  createArticle(article: KnowledgeArticle): Observable<KnowledgeArticle> {
    article.createdAt = new Date().toISOString();
    article.updatedAt = new Date().toISOString();
    return this.http.post<KnowledgeArticle>(this.apiUrl, article);
  }

  updateArticle(id: number, article: KnowledgeArticle): Observable<KnowledgeArticle> {
    article.updatedAt = new Date().toISOString();
    return this.http.put<KnowledgeArticle>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
