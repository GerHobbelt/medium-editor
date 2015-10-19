(function () {
    'use strict';

    var bulletColorPickerForm = MediumEditor.extensions.form.extend({

        name: 'bulletcolorpicker',
        action: 'colorpicker',
        aria: 'Sélectionner une couleur pour les puces',
        contentDefault: 'Color', // ±
        contentFA: '<i class="fa fa-dot-circle-o"></i>',

        init: function () {
            MediumEditor.extensions.form.prototype.init.apply(this, arguments);
        },

        // Called when the button the toolbar is clicked
        // Overrides ButtonExtension.handleClick
        handleClick: function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.isDisplayed()) {
                // Get fontsize of current selection (convert to string since IE returns this as number)
                var color = this.getInput().value || '';
                this.showForm(color);
            }

            return false;
        },

        // Called by medium-editor to append form to the toolbar
        getForm: function () {
            if (!this.form) {
                this.form = this.createForm();
            }
            return this.form;
        },

        // Used by medium-editor when the default toolbar is to be displayed
        isDisplayed: function () {
            return this.getForm().style.display === 'block';
        },

        hideForm: function () {
            this.getForm().style.display = 'none';
        },

        showForm: function (color) {
            
            var input = this.getInput();

            /*var targetElement = window.getSelection().focusNode.parentElement;
            if(targetElement.tagName !== 'LI' && targetElement.parentElement.tagName == 'LI') {
                targetElement = targetElement.parentElement;
            } else if(targetElement.tagName !== 'LI' && targetElement.parentElement.parentElement.tagName == 'LI') {
                targetElement = targetElement.parentElement.parentElement;
            }*/

            var targetElements = this.getListElements();

            var self = this;
            window['handleBulletColorChange' + this.getEditorId()] = function(editor) {
                self.handleColorChange(editor, targetElements);
            };

            this.base.saveSelection();
            this.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.setToolbarPosition();

            jscolor.dir = '/img/';
            jscolor.init();

            input.value = color || '';
            input.focus();
        },

        getListElements: function() {
            var selection = window.getSelection();
            var range = selection.getRangeAt(0);
            var elements = [];
            var startEl = range.startContainer;
            var endEl = range.endContainer;

            if(startEl.innerHTML === endEl.wholeText) {
                startEl = endEl;
            }

            if(startEl === endEl) {
                // If 1 element in selection
                
                var el = startEl;

                for ( ; el && el !== document; el = el.parentNode ) {   
                    if ( typeof el.tagName !== 'undefined' && el.tagName.toLowerCase() === 'li') {
                        elements.push(el);
                        break;
                    }
                }
            } else {
                // If several DOM elements selection

                var allWithinRangeParent = range.commonAncestorContainer.getElementsByTagName("li");

                var allSelected = [];
                for (var i=0, el; el = allWithinRangeParent[i]; i++) {
                    if (selection.containsNode(el, true) ) {
                        elements.push(el);
                    }
                }
            } 

            return elements; 
        },

        // Called by core when tearing down medium-editor (destroy)
        destroy: function () {
            if (!this.form) {
                return false;
            }

            if (this.form.parentNode) {
                this.form.parentNode.removeChild(this.form);
            }

            delete this.form;
        },

        // core methods

        doFormSave: function () {
            this.base.restoreSelection();
            this.base.checkSelection();
        },

        doFormCancel: function () {
            this.base.restoreSelection();
            this.clearColor();
            this.base.checkSelection();
        },

        // form creation and event handling
        createForm: function () {
            var doc = this.document,
                form = doc.createElement('div'),
                input = doc.createElement('input'),
                close = doc.createElement('a'),
                save = doc.createElement('a');


            // Font Size Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-bulletcolorpicker-' + this.getEditorId();

            // Handle clicks on the form itself
            this.on(form, 'click', this.handleFormClick.bind(this));

            // Add font size slider
            input.setAttribute('type', 'text');
            input.id = 'bullet_color_picker_' + this.getEditorId();
            input.className = 'medium-editor-toolbar-input editor-bulletcolorpicker-input color{pickerClosable:true, pickerPosition:\'left\', onImmediateChange:\'window.handleBulletColorChange' + this.getEditorId() + '(this)\'}';
            input.value = 'fffaed';
            form.appendChild(input);

            // Add save buton
            save.setAttribute('href', '#');
            save.className = 'medium-editor-toobar-save';
            save.innerHTML = this.getEditorOption('buttonLabels') === 'fontawesome' ?
                             '<i class="fa fa-check"></i>' :
                             '&#10003;';
            form.appendChild(save);

            // Handle save button clicks (capture)
            this.on(save, 'click', this.handleSaveClick.bind(this), true);

            // Add close button
            close.setAttribute('href', '#');
            close.className = 'medium-editor-toobar-close';
            close.innerHTML = this.getEditorOption('buttonLabels') === 'fontawesome' ?
                              '<i class="fa fa-times"></i>' :
                              '&times;';
            form.appendChild(close);

            // Handle close button clicks
            this.on(close, 'click', this.handleCloseClick.bind(this));

            this.on(form, 'click', this.handleFormClick.bind(this));

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        clearColor: function () {
          // Do something
        },

        handleColorChange: function (editor, targetElements) {
            editor.valueElement.value = editor.toString();
            var elementId = 'bullet_color_' + editor.toString();

            targetElements.forEach(function(el) {
                el.id = elementId;
                el.setAttribute('data-bullet-color', editor.toString());
            });
            
            document.styleSheets[0].insertRule('.product-sheet .diapo__container ul li#' + elementId + ':before { color: #' + editor.toString() + ' !important}', document.styleSheets[0].cssRules.length);
            this.handleCloseClick.bind(this);
            this.doFormSave();

            // Trigger blur's callback
            $('.angular-medium-editor').trigger('blur');
        },

        handleFormClick: function (event) {
            // make sure not to hide form when clicking inside the form
            event.stopPropagation();
        },

        handleSaveClick: function (event) {
            // Clicking Save -> create the font size
            event.preventDefault();
            this.doFormSave();
        },

        handleCloseClick: function (event) {
            // Click Close -> close the form
            event.preventDefault();
            this.doFormCancel();
        }
    });

    MediumEditor.extensions.bulletColorPicker = bulletColorPickerForm;
}());