const LABEL_DEFAULT_TEXT = 'Select an option';

class CustomSelect extends HTMLElement {

    constructor() {
        super();
        const propNames = this.getAttributeNames();
        this.props = {};
        propNames.forEach(prop => {
            this.props[prop] = this.getAttribute(prop);
        });

        this.container = document.createElement('div');
        this.container.setAttribute('role', 'listbox');
        this.container.setAttribute('class', 'custom-select-container')
        this.container.setAttribute('tabindex', this.props.tabindex || '0');
        this.container.setAttribute('aria-label', this.props.label || LABEL_DEFAULT_TEXT);

        this.dropdown = this.querySelector('custom-select-dropdown');
        this.removeChild(this.dropdown);

        this.options = [...this.dropdown.querySelectorAll('option')];

        this.value = '';
        this._displayValue = '';
        if (this.props.value) {
            let currentOption = this.options.find(option => {
                return option.getAttribute("value") === this.props.value;
            });
            if (currentOption) {
                this._displayValue = currentOption.innerText;
            }
        }

        const label = document.createElement('div');
        label.innerText = this._displayValue || this.props.label || LABEL_DEFAULT_TEXT;
        label.setAttribute('class', 'custom-select-label');
        this.container.appendChild(label);

        const dropdownIcon = document.createElement('i');
        dropdownIcon.setAttribute('class', 'fa-solid fa-chevron-down');
        this.container.appendChild(dropdownIcon);

        this.appendChild(this.container);

        this._setUpListeners();
    }

    _setUpListeners() {
        window.addEventListener('click', (event) => this._onWindowClick(event));
        this.options.forEach(option => {
            option.addEventListener('click', (event) => this._onOptionClick(event));
        })
    }

    _onWindowClick(event) {
        let clickedOutside = event.target !== this && !this.contains(event.target);
        let isDropDownOpen = this.contains(this.dropdown);
        let clickedInsideContainer = event.target === this.container || this.container.contains(event.target);
        if (clickedOutside || (isDropDownOpen && clickedInsideContainer)) {
            this._closeDropdown();
        } else if (clickedInsideContainer) {
            this._openDropdown();
        }
    }

    _closeDropdown() {
        this.dropdown.classList.add('pre-close');
        window.setTimeout(() => {
            this.removeChild(this.dropdown);
            this.dropdown.classList.remove('pre-close');
        }, 200)
    }
    _openDropdown() {
        this.dropdown.classList.add('pre-open');
        this.appendChild(this.dropdown);
        window.setTimeout(() => {
            this.dropdown.classList.remove('pre-open');
        }, 200)
    }

    _onOptionClick(event) {
        this.value = event.target.getAttribute('value');
        this._displayValue = event.target.innerText;
        this.querySelector('.custom-select-label').innerText = this._displayValue;
        this._closeDropdown();  
    }
}

customElements.define('custom-select', CustomSelect);