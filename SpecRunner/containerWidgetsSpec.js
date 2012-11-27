// Generated by CoffeeScript 1.3.3

describe("widgets.ContainerWidget", function() {
  beforeEach(function() {
    var _genWidgetDef;
    this.subschema = [
      {
        field: "CharField",
        name: "sub1",
        minLength: 5
      }, {
        field: "CharField",
        name: "sub2",
        minLength: 5
      }
    ];
    this.vals = {
      sub1: "hello",
      sub2: "moon"
    };
    this.schema = {
      field: "ContainerField",
      name: "container",
      schema: this.subschema,
      value: this.vals
    };
    _genWidgetDef = widgets.Form.prototype._genWidgetDef;
    return this.widget = new widgets.ContainerWidget(_genWidgetDef(this.schema));
  });
  it("should create child widgets, add to _widgets, and set value and parentWidget", function() {
    expect(this.widget._widgets.length).toBe(2);
    expect(this.widget._widgets[0].parentWidget).toBe(this.widget);
    return expect(this.widget._widgets[1].getValue()).toBe("moon");
  });
  return it("should set value with setValue", function() {
    var val;
    val = enyo.clone(this.vals);
    val.sub2 = "world";
    this.widget.setValue(val);
    expect(this.widget._widgets[0].getValue()).toBe("hello");
    return expect(this.widget._widgets[1].getValue()).toBe("world");
  });
});

describe("widgets.ListWidget", function() {
  beforeEach(function() {
    var _genWidgetDef;
    this.subschema = {
      field: "CharField",
      minLength: 5
    };
    this.vals = ["hello", "moon"];
    this.schema = {
      field: "ListField",
      name: "container",
      schema: this.subschema,
      value: this.vals
    };
    _genWidgetDef = widgets.Form.prototype._genWidgetDef;
    return this.widget = new widgets.ListWidget(_genWidgetDef(this.schema));
  });
  it("should create child widgets, add to _widgets, and set value and parentWidget", function() {
    expect(this.widget._widgets.length).toBe(2);
    expect(this.widget._widgets[0].parentWidget).toBe(this.widget);
    return expect(this.widget._widgets[0].value).toBe("hello");
  });
  return it("should create a new empty child widget when getWidget called with a path one greater than the number of childWidgets", function() {
    expect(this.widget.getWidget([0]).getValue()).toBe("hello");
    expect(this.widget.getWidget([3])).toBe(void 0);
    expect(this.widget.getWidget([2]).kind).toBe("widgets.Widget");
    return expect(this.widget._widgets.length).toBe(3);
  });
});

describe("widget traversal", function() {
  beforeEach(function() {
    var _genWidgetDef;
    this.vals = {
      firstList: [
        {
          secondList: ["hello", "moon"]
        }
      ]
    };
    this.schema = {
      field: "ContainerField",
      name: "firstContainer",
      value: this.vals,
      schema: [
        {
          field: "ListField",
          name: "firstList",
          schema: {
            field: "ContainerField",
            name: "secondContainer",
            schema: [
              {
                field: "ListField",
                name: "secondList",
                schema: {
                  field: "CharField",
                  name: "text",
                  minLength: 5
                }
              }
            ]
          }
        }
      ]
    };
    _genWidgetDef = widgets.Form.prototype._genWidgetDef;
    return this.widget = new widgets.ContainerWidget(_genWidgetDef(this.schema));
  });
  it("should create nested fields from nested schema", function() {
    return expect(this.widget.getValue()).toEqual(this.vals);
  });
  it("should be able to get any widget by path; path can only be an array b/c it should only be called by widgets.Form that converts strings to arrays.", function() {
    expect(this.widget.getWidget([]).fieldName).toBe("firstContainer");
    return expect(this.widget.getWidget(["firstList", 0, "secondList", 1]).getValue()).toBe("moon");
  });
  return it("should return path of any widget", function() {
    var path;
    expect(this.widget.getPath()).toEqual([]);
    path = ["firstList", 0, "secondList", 1];
    return expect(this.widget.getWidget(path).getPath()).toEqual(path);
  });
});