import { Component, Listen, Method } from '@stencil/core';
import { Modal, ModalEvent, ModalOptions } from '../../index';

let ids = 0;
const modals = new Map<number, Modal>();

@Component({
  tag: 'ion-modal-controller'
})
export class ModalController {

  @Method()
  create(opts?: ModalOptions): Promise<HTMLIonModalElement> {
    // create ionic's wrapping ion-modal component
    const modalElement = document.createElement('ion-modal');

    // give this modal a unique id
    modalElement.modalId = ids++;

    // convert the passed in modal options into props
    // that get passed down into the new modal
    Object.assign(modalElement, opts);

    // append the modal element to the document body
    const appRoot = document.querySelector('ion-app') || document.body;
    appRoot.appendChild(modalElement);

    return (modalElement as any).componentOnReady();
  }

  @Method()
  dismiss(data?: any, role?: any, modalId: number = -1) {
    modalId = modalId >= 0 ? modalId : getHighestId();
    const modal = modals.get(modalId);
    return modal.dismiss(data, role);
  }


  @Listen('body:ionModalWillPresent')
  protected modalWillPresent(ev: ModalEvent) {
    console.log('modalWillPresent');
    modals.set(ev.target.modalId, ev.target);
  }


  @Listen('body:ionModalWillDismiss, body:ionModalDidUnload')
  protected modalWillDismiss(ev: ModalEvent) {
    console.log('modalWillDismiss');
    modals.delete(ev.target.modalId);
  }


  @Listen('body:keyup.escape')
  protected escapeKeyUp() {
    removeLastModal();
  }
}

function getHighestId() {
  let minimum = -1;
  modals.forEach((_modal: Modal, id: number) => {
    if (id > minimum) {
      minimum = id;
    }
  });
  return minimum;
}

function removeLastModal() {
  const toRemove = modals.get(getHighestId());
  return toRemove ? toRemove.dismiss() : Promise.resolve();
}