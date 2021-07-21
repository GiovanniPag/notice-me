/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { IAttachment } from '../attachment.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'jhi-carousel-attach',
  templateUrl: './carousel.component.html',
})
export class jhiCarouselComponent {
  @Input() public images?: IAttachment[];
  @Input() public showNavigationIndicators?: boolean;
  @Input() public disableRemove = false;
  @Input() public showNavigationArrows?: boolean;
  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;

  @Output() public onAttachmentRemove = new EventEmitter<IAttachment>();

  paused = false;
  pauseOnHover = true;
  pauseOnFocus = true;

  constructor(private sanitizer: DomSanitizer) {}

  showIndicators(): boolean {
    if (this.showNavigationIndicators !== undefined) {
      return this.showNavigationIndicators;
    } else if (this.images !== undefined) {
      return this.images.length > 1;
    } else {
      return false;
    }
  }

  showArrows(): boolean {
    if (this.showNavigationArrows !== undefined) {
      return this.showNavigationArrows;
    } else if (this.images !== undefined) {
      return this.images.length > 1;
    } else {
      return false;
    }
  }

  public removeItem(attachment: IAttachment): void {
    this.onAttachmentRemove.emit(attachment);
  }

  getImage(img: IAttachment): SafeUrl {
    const contentType = img.dataContentType!;
    const data = img.data!;
    const fileURL = `data:${contentType};base64,${data}`;
    const safe = this.sanitizer.bypassSecurityTrustUrl(fileURL);
    return safe;
  }

  togglePaused(): void {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }
}
