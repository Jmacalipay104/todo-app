import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TodoService } from '../todo.service';
import { Todo } from '../todo.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule
  ],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  newTodoTitle = '';
  searchQuery = '';
  isLoading = true;

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  ngDoCheck(): void {
    this.filterTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data.slice(0, 10);
        this.filterTodos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching todos:', error);
        this.isLoading = false;
      }
    });
  }

  filterTodos(): void {
    if (!this.searchQuery) {
      this.filteredTodos = [...this.todos];
    } else {
      this.filteredTodos = this.todos.filter(todo => 
        todo.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  addTodo(): void {
    if (!this.newTodoTitle.trim()) return;

    const todo: Partial<Todo> = {
      userId: 1,
      title: this.newTodoTitle,
      completed: false,
    };

    this.todoService.addTodo(todo).subscribe({
      next: (created) => {
        this.todos.unshift(created);
        this.filterTodos();
        this.newTodoTitle = '';
      },
      error: (error) => {
        console.error('Error adding todo:', error);
      }
    });
  }

  toggleComplete(todo: Todo): void {
    this.todoService.updateTodo(todo.id, todo).subscribe({
      error: (error) => {
        console.error('Error updating todo:', error);
        // Revert the change if the update fails
        todo.completed = !todo.completed;
      }
    });
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter((t) => t.id !== id);
        this.filterTodos();
      },
      error: (error) => {
        console.error('Error deleting todo:', error);
      }
    });
  }

  deleteAll(): void {
    // In a real app, you might want to call the service to delete all todos
    this.todos = [];
    this.filterTodos();
  }
}