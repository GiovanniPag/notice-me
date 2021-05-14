import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class SideBarService {
  isActive = false;

  @Output() Sidebarchange: EventEmitter<boolean> = new EventEmitter();

  closeSidebar(): void {
    this.isActive = false;
    this.Sidebarchange.emit(this.isActive);
  }

  toggleSidebar(): void {
    this.isActive = !this.isActive;
    this.Sidebarchange.emit(this.isActive);
  }
}
