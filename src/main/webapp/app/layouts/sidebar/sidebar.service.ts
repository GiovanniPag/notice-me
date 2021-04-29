import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class SideBarService {
  isActive = false;

  @Output() change: EventEmitter<boolean> = new EventEmitter();

  closeSidebar(): void {
    this.isActive = false;
    this.change.emit(this.isActive);
  }

  toggleSidebar(): void {
    this.isActive = !this.isActive;
    this.change.emit(this.isActive);
  }
}
