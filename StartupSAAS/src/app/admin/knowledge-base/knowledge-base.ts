import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseService, KnowledgeArticle } from '../../core/services/knowledge-base.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-admin-knowledge-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knowledge-base.html'
})
export class AdminKnowledgeBaseComponent implements OnInit {
  private readonly kbService = inject(KnowledgeBaseService);
  private readonly modalService = inject(ModalService);

  public articles = signal<KnowledgeArticle[]>([]);
  public showModal = signal(false);
  public isEditing = signal(false);
  public activeArticle = signal<Partial<KnowledgeArticle>>({});

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.kbService.getArticles().subscribe(data => this.articles.set(data));
  }

  openAddModal() {
    this.activeArticle.set({ title: '', content: '', category: '' });
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEditModal(article: KnowledgeArticle) {
    this.activeArticle.set({ ...article });
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  updateField(field: keyof KnowledgeArticle, value: any) {
    this.activeArticle.update(a => ({ ...a, [field]: value }));
  }

  saveArticle() {
    const payload = this.activeArticle() as KnowledgeArticle;
    if (this.isEditing() && payload.id) {
      this.kbService.updateArticle(payload.id, payload).subscribe(() => {
        this.loadArticles();
        this.closeModal();
      });
    } else {
      this.kbService.createArticle(payload).subscribe(() => {
        this.loadArticles();
        this.closeModal();
      });
    }
  }

  async deleteArticle(article: KnowledgeArticle) {
    const confirmed = await this.modalService.confirm('Expunge this knowledge unit permanently?');
    if (confirmed && article.id) {
      this.kbService.deleteArticle(article.id).subscribe(() => this.loadArticles());
    }
  }
}
