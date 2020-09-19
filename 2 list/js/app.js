(function ($) {

    const contacts = [
        { name: "Contact 1", tel: "0123456789"},
        { name: "Contact 2", tel: "0123456789"},
        { name: "Contact 3", tel: "0123456789"},
        { name: "Contact 4", tel: "0123456789"},
        { name: "Contact 5", tel: "0123456789"},
    ];

    // const url = ""

    // const contacts = []
    // $.ajax({
    //     url: url,
    //     method: "GET"
    // }).then(function (result) {
    //     contacts = result
    // })

    // function sendData(type, cid, attributes){
    //     $.ajax({
    //         url: url,
    //         method: type,
    //         data: {
    //             cid: cid,
    //             attributes: attributes
    //         }
    //     }).then(function (result) {
    //         console.log('result', result)
    //     })
    // }

    let Contact = Backbone.Model.extend({
    });

    let Directory = Backbone.Collection.extend({
        model: Contact
    });

    function verification(contactView) {
        contactView.$el.find(".error").remove();
        let error = 0;
        if (contactView.$el.find(".name").val().length === 0){
            contactView.$el.find(".name").after( "<p class='error'>Введите валидное имя</p>" );
            error++;
        }
        if (contactView.$el.find(".tel").val().replace(/-/g,"").match(/^[+0-9][0-9]{9,12}$/) === null){
            contactView.$el.find(".tel").after( "<p class='error'>Введите валидный номер</p>" );
            error++;
        }
        return !error;
    }

    let ContactView = Backbone.View.extend({
        tagName: "tr",
        className: "contact-container",
        events: {
            "click .delete": "remove",
            "click .edit": "editContact",
            "click .save": "saveEdits",
            "click .cancel": "cancelEdit"

        },
        template: document.getElementById("contactTemplate").innerHTML,
        editTemplate: _.template($("#contactEditTemplate").html()),

        render: function () {
            let tmpl = _.template(this.template);
            $(this.el).html(tmpl(this.model.attributes));
            return this;
        },

        remove: function () {
            // sendData("DELETE", this.model.cid, this.model.attributes)
            $(this.el).remove();
        },

        editContact: function () {
            this.$el.html(this.editTemplate(this.model.toJSON()));
        },

        saveEdits: function (e) {
            e.preventDefault();
            let formData = {},
                prev = this.model.previousAttributes();

            $(this.el).find("input").not("button").each(function () {
                let el = $(this);
                formData[el.attr("class")] = el.val().replace(/[.,\/<>#!$%^&*;:{}=_~()]/g,"");
            });

            this.model.set(formData);
            
            if (!verification(this)) {
                this.model.set(prev);
                return false;
            }
            // sendData("POST", this.model.cid, this.model.attributes)
            this.render();
        },
        cancelEdit: function () {
            this.render();
        }

    });

    let FormView = Backbone.View.extend({
        tagName: "tr",
        className: "form-container",
        template: document.getElementById("formTemplate").innerHTML,

        render: function () {
            let tmpl = _.template(this.template);
            $(this.el).html(tmpl(this.model.attributes));
            return this;
        },

        events: {
            "click a.new": "addContact"
        },

        addContact: function (e) {
            e.preventDefault();
            let formData = {};
            $(this.el).find("input").not("button").each(function () {
                let el = $(this);
                formData[el.attr("class")] = el.val().replace(/[.,\/<>#!$%^&*;:{}=_~()]/g,"");
            });

            if (!verification(this)) {
                return false;
            }
            contacts.push(formData);
            let contactView = new ContactView({
                model: new Contact(formData)
            });

            // sendData("PUT", this.model.cid, this.model.attributes)
            this.model.$el.before(this,contactView.render().el);
        }

    });

    let DirectoryView = Backbone.View.extend({
        el: document.getElementById("contacts"),

        initialize: function () {
            this.collection = new Directory(contacts);
            this.render();

            this.collection.on("add", this.renderContact, this);

        },

        render: function () {
            let that = this;
            _.each(this.collection.models, function (item) {
                that.renderContact(item);
            }, this);
            let formView = new FormView({
                model: this
            });
            this.$el.append(formView.render().el);
        },

        renderContact: function (item) {
            let contactView = new ContactView({
                model: item
            });

            this.$el.append(contactView.render().el);
        }
    });

    let directory = new DirectoryView();

} (jQuery));