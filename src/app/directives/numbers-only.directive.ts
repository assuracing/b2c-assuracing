import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]',
  standalone: true
})
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'Enter', 'Escape', 'Delete',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
  
    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return; 
    }
  
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
  
  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedInput = clipboardData.getData('text');

    const numbersOnly = pastedInput.replace(/[^0-9]/g, '');
    
    this.el.nativeElement.value = numbersOnly;
    
    event.preventDefault();
  }
}
