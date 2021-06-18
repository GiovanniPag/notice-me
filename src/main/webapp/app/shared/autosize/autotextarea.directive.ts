import { Optional, Directive, ElementRef, HostListener, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgModel, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[jhiInputTextarea]',
})
export class InputTextareaDirective implements OnInit, AfterViewInit, OnDestroy {
  private firstfocus = true;

  private ngModelSubscription: Subscription | undefined;

  private ngControlSubscription: Subscription | undefined;

  constructor(
    public el: ElementRef,
    private cd: ChangeDetectorRef,
    @Optional() public ngModel?: NgModel,
    @Optional() public control?: NgControl
  ) {}

  ngOnInit(): void {
    this.ngModelSubscription = this.ngModel?.valueChanges?.subscribe(() => {
      this.resize();
    });

    this.ngControlSubscription = this.control?.valueChanges?.subscribe(() => {
      this.resize();
    });
  }

  ngAfterViewInit(): void {
    this.resize();
    this.cd.detectChanges();
  }

  @HostListener('focus', ['$event'])
  onFocus(): void {
    this.firstfocus ? this.resize() : (this.firstfocus = false);
  }

  @HostListener('input', ['$event'])
  onInput(): void {
    this.resize();
  }

  resize(): void {
    if (this.el.nativeElement.style.height === (this.el.nativeElement.scrollHeight as string) + 'px') {
      return;
    }
    this.el.nativeElement.style.overflow = 'hidden';
    this.el.nativeElement.style.height = 'auto';
    this.el.nativeElement.style.height = (this.el.nativeElement.scrollHeight as string) + 'px';
  }

  ngOnDestroy(): void {
    if (this.ngModelSubscription) {
      this.ngModelSubscription.unsubscribe();
    }
    if (this.ngControlSubscription) {
      this.ngControlSubscription.unsubscribe();
    }
  }
}
