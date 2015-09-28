(function () {
    'use strict';

    var IconForm = MediumEditor.extensions.form.extend({

        name: 'icon',
        action: 'icon',
        aria: 'Icône',
        contentDefault: 'Icône', // ±
        contentFA: '<i class="fa fa-fonticons"></i>',

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
                var icon = '';
                this.showForm(icon);
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

        showForm: function (icon) {
            var input = this.getInput();

            this.base.saveSelection();
            this.hideToolbarDefaultActions();
            this.getForm().style.display = 'block';
            this.setToolbarPosition();

            input.value = icon || '';
            input.focus();
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
            this.clearIcon();
            this.base.checkSelection();
        },

        // form creation and event handling
        createForm: function () {
            var doc = this.document,
                form = doc.createElement('div'),
                input = doc.createElement('input'),
                close = doc.createElement('a'),
                remove = doc.createElement('a'),
                save = doc.createElement('a'),
                ul = doc.createElement('ul'),
                iconList = ['fa-cog', 'fa-puzzle-piece', 
                    'fa-calculator', 'fa-plus', 'fa-paper-plane' , 'fa-search'];


            // Font Size Form (div)
            form.className = 'medium-editor-toolbar-form';
            form.id = 'medium-editor-toolbar-form-icon-' + this.getEditorId();

            // Handle clicks on the form itself
            this.on(form, 'click', this.handleFormClick.bind(this));

            // Add font size slider
            input.setAttribute('type', 'hidden');
            input.className = 'medium-editor-toolbar-input editor-icon-input';
            form.appendChild(input);

            ul.setAttribute('class', 'medium-editor-toolbar-icon-list');

            for (var i in iconList) {
                var li = doc.createElement('li');
                li.innerHTML = '<i class="fa ' + iconList[i] + '"></i>';
                li.setAttribute('data-icon', iconList[i]);
                this.on(li, 'click', this.handleIconChange.bind(this, iconList[i]));
                ul.appendChild(li);
            }

            form.appendChild(ul);

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

            // Add remove button
            remove.setAttribute('href', '#');
            remove.className = 'medium-editor-toobar-remove';
            remove.innerHTML = this.getEditorOption('buttonLabels') === 'fontawesome' ?
                              '<i class="fa fa-eraser"></i>' :
                              'Retirer';
            form.appendChild(remove);

            // Handle remove button clicks
            this.on(remove, 'click', this.handleRemoveClick.bind(this));

            return form;
        },

        getInput: function () {
            return this.getForm().querySelector('input.medium-editor-toolbar-input');
        },

        clearIcon: function () {
            MediumEditor.selection.getSelectedElements(this.document).forEach(function (el) {
                if (el.nodeName.toLowerCase() === 'i' && el.hasAttribute('class')) {
                    el.remove();
                }
            });
        },

        handleIconChange: function (icon) {
            this.getInput().value = icon;
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
        },

        handleRemoveClick: function (event) {
            // Click Remove
            this.handleIconChange('none');
            event.preventDefault();
            this.doFormCancel();
        }
    });

    MediumEditor.extensions.icon = IconForm;
}());