import { GemElement, html } from '@mantou/gem/lib/element';
import { customElement, attribute, refobject, RefObject } from '@mantou/gem/lib/decorators';

import { theme } from '../../common/theme';

export type SwitchValue = 'off' | 'on';

@customElement('ele-switch')
export class Switch extends GemElement {
  @attribute name: string;
  @attribute defaultValue: SwitchValue;

  @refobject checkboxRef: RefObject<HTMLInputElement>;

  get control() {
    return this.checkboxRef.element!;
  }
  get value(): SwitchValue {
    return this.control.checked ? 'on' : 'off';
  }

  render() {
    return html`
      <style>
      :host {
        display: contents;
      }
      label {
        position: relative;
        display: flex;
        place-items: center;
        cursor: pointer;
      }
      .track {
        border-radius: 100px;
        width: 2.5em;
        height: 1.2em;
        background: currentColor;
        opacity: .2;
      }
      .btn {
        position: absolute;
        border-radius: 100%;
        width: 1.3em;
        height: 1.3em;
        left: .13em;
        background: currentColor;
        opacity: .5;
        transition: left .2s;
      }
      input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      input:checked ~ label {
        color: rgb(${theme.primaryRGB});
      }
      input:checked ~ label .btn {
        left: calc(100% - 1.3em - .13em);
        opacity: 1;
      }
      input:focus {
        outline: none;
      }
      input:focus-visible ~ label .btn {
        transform: scale(1.4);
      }
      </style>
      <input
        ref=${this.checkboxRef.ref}
        ?checked=${this.defaultValue === 'on'}
        id="control"
        type="checkbox"
      ></input>
      <label for="control">
        <div class="track"></div>
        <div class="btn"></div>
      </label>
    `;
  }
}
