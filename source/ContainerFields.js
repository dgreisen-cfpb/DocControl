// Generated by CoffeeScript 1.3.3
(function() {
  var BaseContainerField, ContainerField, ListField, fields, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if (typeof exports !== "undefined" && exports !== null) {
    utils = require("./utils");
    fields = require("./Fields");
  } else if (typeof window !== "undefined" && window !== null) {
    utils = window.utils;
    fields = window.fields;
  }

  /*
    _fields.BaseContainerField_ is the baseKind for all container-type fields.
    DocControl allows you to create, validate and display arbitrarily complex
    nested data structures. container-type fields contain other fields. There
    are currently two types. A `ContainerField`, analogous to a hash of subfields,
    and a `ListField`, analogous to a list of subfields. container-type fields
    act in most ways like a regular field. You can set them, and all their subfields
    with `setValue`, you can get their, and all their subfields', data with
    `getClean` or `toJSON`.
  
    When a subfield is invalid, the containing field will also be invalid.
  
    You specify a container's subfields in the `schema` attribute. Each container type
    accepts a different format for the `schema`.
  
    DocControl schemas are fully recursive - that is, containers can contain containers,
    allowing you to model and validate highly nested datastructures like you might find
    in a document database.
  */


  BaseContainerField = (function(_super) {

    __extends(BaseContainerField, _super);

    BaseContainerField.prototype.schema = void 0;

    BaseContainerField.prototype._fields = void 0;

    BaseContainerField.prototype.errorMessages = {
      required: utils._i('There must be at least one %s.'),
      invalid: utils._i('Please fix the errors indicated below.')
    };

    function BaseContainerField(opts) {
      BaseContainerField.__super__.constructor.call(this, opts);
      this._invalidFields = {};
      this.value = this.opts.value;
      this.setSchema(this.opts.schema);
    }

    BaseContainerField.prototype.listeners = {
      onValueChanged: "subfieldChanged",
      onValidChanged: "subfieldChanged"
    };

    BaseContainerField.prototype.subfieldChanged = function(inSender, inEvent) {
      if (inSender === inEvent.originator) {
        return this._hasChanged = true;
      }
    };

    BaseContainerField.prototype.isValid = function(opts) {
      var oldErrors, valid, value;
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("isValid", opts);
      }
      if (!this._hasChanged) {
        return this._valid;
      }
      oldErrors = this.errors;
      this.errors = [];
      value = void 0;
      try {
        value = this._querySubfields("getClean");
      } catch (e) {
        this.errors = [this.errorMessages.invalid];
      }
      if (!this.errors.length) {
        this.validate(value);
      }
      if (!this.errors.length && this._hasChanged) {
        try {
          value = this._querySubfields("getClean");
        } catch (e) {
          this.errors.push(this.errorMessages.invalid);
        }
      }
      valid = !this.errors.length;
      this.clean = valid ? value : void 0;
      if (valid !== this._valid || !valid && !utils.isEqual(oldErrors, this.errors)) {
        this.emit("onValidChanged", {
          valid: valid,
          errors: this.errors
        });
        this._valid = valid;
      }
      this._hasChanged = false;
      return valid;
    };

    BaseContainerField.prototype._querySubfields = function() {
      var args, fn;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return utils.map(this.getFields(), function(x) {
        return x[fn].apply(x, args);
      });
    };

    BaseContainerField.prototype.getFields = function(opts) {
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("getFields", opts);
      }
      return this._fields;
    };

    BaseContainerField.prototype.getField = function(path) {
      var subfield;
      if (typeof path === "string") {
        path = path.split(".");
      }
      if (path.length === 0) {
        return this;
      }
      subfield = this._getField(path.shift());
      if (!(subfield != null)) {
        return void 0;
      }
      return subfield.getField(path);
    };

    BaseContainerField.prototype.resetFields = function() {
      if (this._fields && this._fields.length) {
        this.value = this.getValue();
      }
      return this._fields = [];
    };

    BaseContainerField.prototype.throwValidationError = function() {
      if (!this.isValid()) {
        throw this.errors;
      }
    };

    BaseContainerField.prototype.getValue = function(opts) {
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("getValue", opts);
      }
      return this._querySubfields("getValue");
    };

    BaseContainerField.prototype.getClean = function(opts) {
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("getClean", opts);
      }
      this.throwValidationError();
      return this.clean;
    };

    BaseContainerField.prototype.toJSON = function(opts) {
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("toJSON", opts);
      }
      this.throwValidationError();
      return this._querySubfields("toJSON");
    };

    BaseContainerField.prototype.getErrors = function(opts) {
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("getErrors", opts);
      }
      this.isValid();
      if (!this.errors.length) {
        return null;
      }
      return this._querySubfields("getErrors");
    };

    BaseContainerField.prototype._addField = function(definition, value) {
      var field;
      definition = utils.clone(definition);
      definition.parent = this;
      if (value != null) {
        definition.value = value;
      }
      field = utils.genField(definition, fields);
      this._fields.push(field);
      return field;
    };

    BaseContainerField.prototype._applyToSubfield = function() {
      var args, fn, opts, subfield;
      fn = arguments[0], opts = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      subfield = this.getField(opts.path);
      delete opts.path;
      args.push(opts);
      return subfield[fn].apply(subfield, args);
    };

    return BaseContainerField;

  })(fields.Field);

  /*
    A ContainerField contains a number of heterogeneous
    subfields. When data is extracted from it using `toJSON`, or `getClean`, the
    returned data is in a hash object where the key is the name of the subfield
    and the value is the value of the subfield.
  
    the schema for a ContainerField is an Array of kind definition objects such as
    `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`.
    The ContainerField will contain the specified array of heterogenious fields.
  */


  ContainerField = (function(_super) {

    __extends(ContainerField, _super);

    function ContainerField() {
      return ContainerField.__super__.constructor.apply(this, arguments);
    }

    ContainerField.prototype.widget = "widgets.ContainerWidget";

    ContainerField.prototype.setValue = function(values, opts) {
      var field, origValue, _i, _len;
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("setValue", opts, values);
      }
      origValue = this.getValue();
      if (!values || utils.isEqual(values, origValue) || !this._fields) {
        return;
      }
      if (!(values instanceof Object) || values instanceof Array) {
        throw "values must be a hash";
      }
      fields = this.getFields();
      for (_i = 0, _len = fields.length; _i < _len; _i++) {
        field = fields[_i];
        field.setValue(values[field.name]);
      }
      return this.emit("onValueChanged", {
        value: values,
        original: origValue
      });
    };

    ContainerField.prototype._getField = function(name) {
      var field, _i, _len, _ref;
      _ref = this.getFields();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        if (field.name === name) {
          return field;
        }
      }
    };

    ContainerField.prototype.setSchema = function(schema, opts) {
      var definition, value, _i, _len;
      if ((opts != null ? opts.path : void 0) != null) {
        return this._applyToSubfield("setSchema", opts, schema);
      }
      if (!(schema != null) || schema === this.schema) {
        return;
      }
      this.schema = schema;
      this.resetFields();
      for (_i = 0, _len = schema.length; _i < _len; _i++) {
        definition = schema[_i];
        value = this.value != null ? this.value[definition.name] : void 0;
        this._addField(definition, value);
      }
      return this.value = void 0;
    };

    ContainerField.prototype.validate = function(value) {
      return value;
    };

    ContainerField.prototype._querySubfields = function() {
      var args, fn, out;
      fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      out = {};
      utils.forEach(this.getFields(), function(x) {
        return out[x.name] = x[fn].apply(x, args);
      });
      return out;
    };

    ContainerField.prototype.getPath = function(subfield) {
      var end;
      end = [];
      if (subfield) {
        end.push(subfield.name);
      }
      if (this.parent) {
        return this.parent.getPath(this).concat(end);
      } else {
        return end;
      }
    };

    return ContainerField;

  })(BaseContainerField);

  /*
      A ListField contains an arbitrary number of identical
      subfields. When data is extracted from it using `toJSON`, or `getClean`, the
      returned data is in a list where each value is the value of the subfield at
      the corresponding index.
  
      A ListField's `schema` consists of a single field definition, such as
      `{ kind: "email" }`. The ListField's `fields` attribute will then contain
      an array of subfields of that kind.
  */


  ListField = (function(_super) {

    __extends(ListField, _super);

    function ListField() {
      return ListField.__super__.constructor.apply(this, arguments);
    }

    ListField.prototype.widget = "widgets.ListWidget";

    ListField.prototype.setSchema = function(schema) {
      if ((typeof opts !== "undefined" && opts !== null ? opts.path : void 0) != null) {
        return this._applyToSubfield("setSchema", opts, schema);
      }
      if (!(schema != null) || schema === this.schema) {
        return;
      }
      this.schema = schema;
      this.resetFields();
      this.setValue(this.value);
      return this.value = void 0;
    };

    ListField.prototype.setValue = function(values) {
      var value, _i, _len;
      if ((typeof opts !== "undefined" && opts !== null ? opts.path : void 0) != null) {
        return this._applyToSubfield("setValue", opts, values);
      }
      if (!values || !this.schema || utils.isEqual(values, this.getValue())) {
        return;
      }
      if (!(values instanceof Array)) {
        throw "values must be an array";
      }
      this.resetFields();
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        this._addField(this.schema, value);
      }
      this.emit("onValueChanged", {
        value: values,
        original: this.value
      });
      return this.value = void 0;
    };

    ListField.prototype.addField = function(definition, fields) {
      var value;
      if (fields == null) {
        fields = fields;
      }
      value = this.getValue();
      this._addField(definition, fields);
      return this.emit("onValueChanged", {
        value: this.getValue(),
        original: value
      });
    };

    ListField.prototype.removeField = function(index) {
      var value;
      value = this.getValue();
      value.splice(index, 1);
      this.setValue(value);
      return this.emit("onValueChanged", {
        value: this.getValue(),
        original: value
      });
    };

    ListField.prototype._getField = function(index) {
      return this.getFields()[index];
    };

    ListField.prototype.validate = function(value) {
      var message;
      if (!value.length && this.required) {
        message = this.errorMessages.required;
        this.errors = [interpolate(message, [this.schema.name || (typeof this.schema.field === "string" && this.schema.field.slice(0, -5)) || "item"])];
        return value;
      }
    };

    ListField.prototype.getPath = function(subfield) {
      var end;
      end = [];
      if (subfield) {
        end.push(this.getFields().indexOf(subfield));
      }
      if (this.parent) {
        return this.parent.getPath(this).concat(end);
      } else {
        return end;
      }
    };

    return ListField;

  })(BaseContainerField);

  fields.BaseContainerField = BaseContainerField;

  fields.ContainerField = ContainerField;

  fields.ListField = ListField;

  if (typeof window !== "undefined" && window !== null) {
    window.fields = fields;
  } else if (typeof exports !== "undefined" && exports !== null) {
    module.exports = fields;
  }

}).call(this);
