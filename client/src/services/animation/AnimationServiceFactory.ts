// Open/Closed Principle (OCP) - Factory extensível para serviços de animação
import { 
  IModalAnimationService, 
  IButtonAnimationService, 
  ICardAnimationService,
  IMicroInteractionService,
  INativeStyleService
} from './IAnimationService';

import { ModalAnimationService } from './ModalAnimationService';
import { ButtonAnimationService } from './ButtonAnimationService';
import { CardAnimationService } from './CardAnimationService';
import { MicroInteractionService } from './MicroInteractionService';
import { NativeStyleService } from './NativeStyleService';

export type AnimationServiceType = 
  | 'modal' 
  | 'button' 
  | 'card' 
  | 'microInteraction'
  | 'nativeStyle';

export class AnimationServiceFactory {
  private static services = new Map<AnimationServiceType, any>();

  static createModalAnimationService(): IModalAnimationService {
    if (!this.services.has('modal')) {
      this.services.set('modal', new ModalAnimationService());
    }
    return this.services.get('modal');
  }

  static createButtonAnimationService(): IButtonAnimationService {
    if (!this.services.has('button')) {
      this.services.set('button', new ButtonAnimationService());
    }
    return this.services.get('button');
  }

  static createCardAnimationService(): ICardAnimationService {
    if (!this.services.has('card')) {
      this.services.set('card', new CardAnimationService());
    }
    return this.services.get('card');
  }

  static createMicroInteractionService(): IMicroInteractionService {
    if (!this.services.has('microInteraction')) {
      this.services.set('microInteraction', new MicroInteractionService());
    }
    return this.services.get('microInteraction');
  }

  static createNativeStyleService(): INativeStyleService {
    if (!this.services.has('nativeStyle')) {
      this.services.set('nativeStyle', new NativeStyleService());
    }
    return this.services.get('nativeStyle');
  }

  // Dependency Inversion Principle (DIP) - Criação baseada em abstrações
  static createService<T>(type: AnimationServiceType): T {
    switch (type) {
      case 'modal':
        return this.createModalAnimationService() as T;
      case 'button':
        return this.createButtonAnimationService() as T;
      case 'card':
        return this.createCardAnimationService() as T;
      case 'microInteraction':
        return this.createMicroInteractionService() as T;
      case 'nativeStyle':
        return this.createNativeStyleService() as T;
      default:
        throw new Error(`Animation service type ${type} not supported`);
    }
  }
}