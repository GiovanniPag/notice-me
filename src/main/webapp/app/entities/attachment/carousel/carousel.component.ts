import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { IAttachment } from '../attachment.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'jhi-carousel-attach',
  templateUrl: './carousel.component.html',
})
export class jhiCarouselComponent implements OnInit {
  @Input() public images!: IAttachment[];
  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;

  paused = false;
  pauseOnHover = true;
  pauseOnFocus = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // eslint-disable-next-line no-console
    console.log(this.images);
    return;
  }

  getImage(img: IAttachment): SafeUrl {
    // eslint-disable-next-line no-console
    console.log(img);
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
