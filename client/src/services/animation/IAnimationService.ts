// Interface Segregation Principle (ISP) - Interfaces específicas para animações
export interface IModalAnimationService {
  enterAnimation(): string;
  exitAnimation(): string;
  scaleAnimation(): string;
}

export interface IButtonAnimationService {
  pressAnimation(): string;
  hoverAnimation(): string;
  loadingAnimation(): string;
}

export interface ICardAnimationService {
  enterAnimation(): string;
  hoverAnimation(): string;
  selectAnimation(): string;
}

export interface IMicroInteractionService {
  rippleEffect(): string;
  pulseEffect(): string;
  bounceEffect(): string;
  slideEffect(): string;
}

export interface INativeStyleService {
  getIOSStyles(): Record<string, string>;
  getAndroidStyles(): Record<string, string>;
  getCurrentPlatformStyles(): Record<string, string>;
}