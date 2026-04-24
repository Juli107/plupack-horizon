import { Component } from '@theme/component';
import { fetchConfig, debounce, onAnimationEnd, prefersReducedMotion, resetShimmer } from '@theme/utilities';
import { morphSection, sectionRenderer } from '@theme/section-renderer';
import { morph } from '@theme/morph';
import {
  ThemeEvents,
  CartUpdateEvent,
  QuantitySelectorUpdateEvent,
  CartAddEvent,
  DiscountUpdateEvent,
} from '@theme/events';
import { cartPerformance } from '@theme/performance';

/** @typedef {import('./utilities').TextComponent} TextComponent */

/**
 * A custom element that displays a cart items component.
 *
 * @typedef {object} Refs
 * @property {HTMLElement[]} quantitySelectors - The quantity selector elements.
 * @property {HTMLTableRowElement[]} cartItemRows - The cart item rows.
 * @property {TextComponent} cartTotal - The cart total.
 *
 * @extends {Component<Refs>}
 */
class CartItemsComponent extends Component {
  #debouncedOnChange = debounce(this.#onQuantityChange, 300).bind(this);

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener(ThemeEvents.cartUpdate, this.#handleCartUpdate);
    document.addEventListener(ThemeEvents.discountUpdate, this.handleDiscountUpdate);
    document.addEventListener(ThemeEvents.quantitySelectorUpdate, this.#debouncedOnChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener(ThemeEvents.cartUpdate, this.#handleCartUpdate);
    document.removeEventListener(ThemeEvents.quantitySelectorUpdate, this.#debouncedOnChange);
  }

  /**
   * Handles QuantitySelectorUpdateEvent change event.
   * @param {QuantitySelectorUpdateEvent} event - The event.
   */
  #onQuantityChange(event) {
    const { quantity, cartLine: line } = event.detail;

    if (!line) return;

    if (quantity === 0) {
      return this.onLineItemRemove(line);
    }

    this.updateQuantity({
      line,
      quantity,
      action: 'change',
    });
    const lineItemRow = this.refs.cartItemRows[line - 1];

    if (!lineItemRow) return;

    const textComponent = /** @type {TextComponent | undefined} */ (lineItemRow.querySelector('text-component'));
    textComponent?.shimmer();
  }

  /**
   * Handles the line item removal.
   * @param {number} line - The line item index.
   */
  onLineItemRemove(line) {
    this.updateQuantity({
      line,
      quantity: 0,
      action: 'clear',
    });

    const cartItemRowToRemove = this.refs.cartItemRows[line - 1];

    if (!cartItemRowToRemove) return;

    const rowsToRemove = [
      cartItemRowToRemove,
      // Get all nested lines of the row to remove
      ...this.refs.cartItemRows.filter((row) => row.dataset.parentKey === cartItemRowToRemove.dataset.key),
    ];

    // Add class to the row to trigger the animation
    rowsToRemove.forEach((row) => {
      const remove = () => row.remove();

      if (prefersReducedMotion()) return remove();

      row.style.setProperty('--row-height', `${row.clientHeight}px`);
      row.classList.add('removing');

      // Remove the row after the animation ends
      onAnimationEnd(row, remove);
    });
  }

  /**
   * Updates the quantity.
   * @param {Object} config - The config.
   * @param {number} config.line - The line.
   * @param {number} config.quantity - The quantity.
   * @param {string} config.action - The action.
   */
  updateQuantity(config) {
    const cartPerformaceUpdateMarker = cartPerformance.createStartingMarker(`${config.action}:user-action`);

    this.#disableCartItems();

    const { line, quantity } = config;
    const { cartTotal } = this.refs;

    const cartItemsComponents = document.querySelectorAll('cart-items-component');
    const sectionsToUpdate = new Set([this.sectionId]);
    cartItemsComponents.forEach((item) => {
      if (item instanceof HTMLElement && item.dataset.sectionId) {
        sectionsToUpdate.add(item.dataset.sectionId);
      }
    });

    const body = JSON.stringify({
      line: line,
      quantity: quantity,
      sections: Array.from(sectionsToUpdate).join(','),
      sections_url: window.location.pathname,
    });

    cartTotal?.shimmer();

    fetch(`${Theme.routes.cart_change_url}`, fetchConfig('json', { body }))
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        const parsedResponseText = JSON.parse(responseText);

        resetShimmer(this);

        if (parsedResponseText.errors) {
          this.#handleCartError(line, parsedResponseText);
          return;
        }

        const newSectionHTML = new DOMParser().parseFromString(
          parsedResponseText.sections[this.sectionId],
          'text/html'
        );

        // Grab the new cart item count from a hidden element
        const newCartHiddenItemCount = newSectionHTML.querySelector('[ref="cartItemCount"]')?.textContent;
        const newCartItemCount = newCartHiddenItemCount ? parseInt(newCartHiddenItemCount, 10) : 0;

        // Update data-cart-quantity for all matching variants
        this.#updateQuantitySelectors(parsedResponseText);

        this.dispatchEvent(
          new CartUpdateEvent({}, this.sectionId, {
            itemCount: newCartItemCount,
            source: 'cart-items-component',
            sections: parsedResponseText.sections,
          })
        );

        this.#morphCartItemsOnly(parsedResponseText.sections[this.sectionId]);

        this.#updateCartQuantitySelectorButtonStates();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.#enableCartItems();
        cartPerformance.measureFromMarker(cartPerformaceUpdateMarker);
      });
  }

  /**
   * Handles the discount update.
   * @param {DiscountUpdateEvent} event - The event.
   */
  handleDiscountUpdate = (event) => {
    this.#handleCartUpdate(event);
  };

  /**
   * Handles the cart error.
   * @param {number} line - The line.
   * @param {Object} parsedResponseText - The parsed response text.
   * @param {string} parsedResponseText.errors - The errors.
   */
  #handleCartError = (line, parsedResponseText) => {
    const quantitySelector = this.refs.quantitySelectors[line - 1];
    const quantityInput = quantitySelector?.querySelector('input');

    if (!quantityInput) throw new Error('Quantity input not found');

    quantityInput.value = quantityInput.defaultValue;

    const cartItemError = this.refs[`cartItemError-${line}`];
    const cartItemErrorContainer = this.refs[`cartItemErrorContainer-${line}`];

    if (!(cartItemError instanceof HTMLElement)) throw new Error('Cart item error not found');
    if (!(cartItemErrorContainer instanceof HTMLElement)) throw new Error('Cart item error container not found');

    cartItemError.textContent = parsedResponseText.errors;
    cartItemErrorContainer.classList.remove('hidden');
  };

  /**
   * Handles the cart update.
   *
   * @param {DiscountUpdateEvent | CartUpdateEvent | CartAddEvent} event
   */
  #handleCartUpdate = (event) => {
    if (event instanceof DiscountUpdateEvent) {
      sectionRenderer.renderSection(this.sectionId, { cache: false });
      return;
    }
    if (event.target === this) return;

    const cartItemsHtml = event.detail.data.sections?.[this.sectionId];
    if (cartItemsHtml) {
      this.#morphCartItemsOnly(cartItemsHtml);

      // Update button states for all cart quantity selectors after morph
      this.#updateCartQuantitySelectorButtonStates();
    } else {
      sectionRenderer.renderSection(this.sectionId, { cache: false });
    }
  };

  /**
   * Disables the cart items.
   */
  #disableCartItems() {
    this.classList.add('cart-items-disabled');
  }

  /**
   * Enables the cart items.
   */
  #enableCartItems() {
    this.classList.remove('cart-items-disabled');
  }

  /**
   * Updates quantity selectors for all matching variants in the cart.
   * @param {Object} updatedCart - The updated cart object.
   * @param {Array<{variant_id: number, quantity: number}>} [updatedCart.items] - The cart items.
   */
  #updateQuantitySelectors(updatedCart) {
    if (!updatedCart.items) return;

    for (const item of updatedCart.items) {
      const variantId = item.variant_id.toString();
      const selectors = document.querySelectorAll(
        `quantity-selector-component[data-variant-id="${variantId}"], cart-quantity-selector-component[data-variant-id="${variantId}"]`
      );

      for (const selector of selectors) {
        const input = selector.querySelector('input[data-cart-quantity]');
        if (!input) continue;

        input.setAttribute('data-cart-quantity', item.quantity.toString());

        // Update the quantity selector's internal state
        if ('updateCartQuantity' in selector && typeof selector.updateCartQuantity === 'function') {
          selector.updateCartQuantity();
        }
      }
    }
  }

  /**
   * Updates button states for all cart quantity selector components.
   */
  #updateCartQuantitySelectorButtonStates() {
    const cartQuantitySelectors = document.querySelectorAll('cart-quantity-selector-component');
    for (const selector of cartQuantitySelectors) {
      if ('updateButtonStates' in selector && typeof selector.updateButtonStates === 'function') {
        selector.updateButtonStates();
      }
    }
  }

  /**
   * Morphs only the inner cart-items-component subtree(s) for the current
   * section, instead of morphing the entire header section. This avoids
   * touching the surrounding <dialog> (cart drawer), which would otherwise
   * lose its top-layer `:modal` state and retrigger slide-in animations.
   * @param {string} sectionHtml - New section HTML from Section Rendering API.
   */
  #morphCartItemsOnly(sectionHtml) {
    const newSection = new DOMParser().parseFromString(sectionHtml, 'text/html');
    const newCartItems = newSection.querySelector(
      `cart-items-component[data-section-id="${this.sectionId}"]`
    );
    if (!newCartItems) {
      morphSection(this.sectionId, sectionHtml);
      return;
    }

    const existingCartItems = document.querySelectorAll(
      `cart-items-component[data-section-id="${this.sectionId}"]`
    );

    for (const existing of existingCartItems) {
      morph(existing, newCartItems.cloneNode(true));
    }

    this.#syncCartDrawerDialogClass(newSection);
  }

  /**
   * Syncs class attribute on the surrounding cart-drawer <dialog> from the new
   * section HTML. Needed because the enclosing morph is bypassed, so the
   * empty/non-empty class toggle on the dialog would otherwise never update.
   * @param {Document} newSection
   */
  #syncCartDrawerDialogClass(newSection) {
    const existingDialog = this.closest('cart-drawer-component')?.querySelector(
      'dialog.cart-drawer__dialog'
    );
    const newDialog = newSection.querySelector('dialog.cart-drawer__dialog');
    if (!existingDialog || !newDialog) return;

    const newClass = newDialog.getAttribute('class') || '';
    if (existingDialog.getAttribute('class') !== newClass) {
      existingDialog.setAttribute('class', newClass);
    }

    const newLabelledBy = newDialog.getAttribute('aria-labelledby');
    if (newLabelledBy && existingDialog.getAttribute('aria-labelledby') !== newLabelledBy) {
      existingDialog.setAttribute('aria-labelledby', newLabelledBy);
    }
  }

  /**
   * Marks any open :modal dialogs inside the section so morph-related flashes
   * (animation retrigger + brief non-modal paint) are suppressed via CSS.
   * @returns {HTMLDialogElement[]} The dialogs that were marked.
   */
  #markModalDialogsForMorph() {
    const section = document.getElementById(`shopify-section-${this.sectionId}`);
    if (!section) return [];

    const dialogs = /** @type {HTMLDialogElement[]} */ (
      Array.from(section.querySelectorAll('dialog')).filter(
        (d) => d instanceof HTMLDialogElement && d.open && d.matches(':modal')
      )
    );

    for (const d of dialogs) d.setAttribute('data-morph-restoring-modal', '');
    return dialogs;
  }

  /**
   * Schedules marker removal only after the dialog is actually closed. Removing
   * it while the dialog is still open would retrigger the slide-in animation
   * because `animation-name` would change from `none` back to the real value.
   * @param {HTMLDialogElement[]} dialogs - The dialogs previously marked.
   */
  #unmarkModalDialogsAfterMorph(dialogs) {
    if (!dialogs.length) return;

    for (const d of dialogs) {
      const parent = d.closest('cart-drawer-component, dialog-component');
      if (!parent) {
        d.removeAttribute('data-morph-restoring-modal');
        continue;
      }
      const clear = () => d.removeAttribute('data-morph-restoring-modal');
      parent.addEventListener('dialog:close', clear, { once: true });
    }
  }

  /**
   * Gets the section id.
   * @returns {string} The section id.
   */
  get sectionId() {
    const { sectionId } = this.dataset;

    if (!sectionId) throw new Error('Section id missing');

    return sectionId;
  }
}

if (!customElements.get('cart-items-component')) {
  customElements.define('cart-items-component', CartItemsComponent);
}
