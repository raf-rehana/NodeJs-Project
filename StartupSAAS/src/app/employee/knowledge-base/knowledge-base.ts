import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseService, KnowledgeArticle } from '../../core/services/knowledge-base.service';

@Component({
  selector: 'app-employee-knowledge-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knowledge-base.html',
  styleUrl: './knowledge-base.css'
})
export class EmployeeKnowledgeBaseComponent implements OnInit {
  private readonly kbService = inject(KnowledgeBaseService);

  public articles = signal<KnowledgeArticle[]>([]);
  public selectedArticle = signal<KnowledgeArticle | null>(null);
  public searchTerm = signal<string>('');

  public filteredArticles = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const list = this.articles();
    if (!term) return list;
    return list.filter(a =>
      a.title.toLowerCase().includes(term) ||
      a.content.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.kbService.getArticles().subscribe((data: KnowledgeArticle[]) => {
      this.articles.set(data);
    });
  }

  filterArticles(term: string) {
    this.searchTerm.set(term);
  }

  selectArticle(article: KnowledgeArticle | null) {
    this.selectedArticle.set(article);
  }
}
