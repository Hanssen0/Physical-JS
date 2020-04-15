function ReportError(err) {
  console.log(err);
}
function CreateTag() {
  let div = document.createElement("div");
  document.body.append(div);
  div.style.position = "absolute";
  return div;
}
function SetCss(tag, name, value) {
  tag.style[name] = value;
}
class Point {
  constructor(x, y) {
    this.Set(x, y);
  }
  Set(x, y) {
    switch (typeof(x)) {
    case "number":
      this.x_ = x;
      this.y_ = y;
      break;
    case "object":
      this.Set(x.x_, x.y_);
      break;
    }
  }
  IsBigger(b) {
    return this.x_ > b.x_ && this.y_ > b.y_;
  }
}
class Instance {
  constructor() {
    this._color_ = "#f0f";
    this._position_ = new Point();
    this._size_ = new Point();
    this._tag_ = CreateTag();
  }
  set size(size) {this._size_.Set(size);}
  get size() {return this._size_;}
  set position(position) {this._position_.Set(position);}
  get position() {return this._position_;}
  set color(color) {this._color_ = color;}
  ApplyProperties() {
    SetCss(this._tag_, "left", this.position.x_ + "px");
    SetCss(this._tag_, "top", this.position.y_ + "px");
    SetCss(this._tag_, "width", this.size.x_ + "px");
    SetCss(this._tag_, "height", this.size.y_ + "px");
    SetCss(this._tag_, "backgroundColor", this._color_);
  }
  Area() {
    ReportError("The subclass doesn't implement Instance.Area() method.");
  }
  Destroy() {this._tag_.remove();}
}
class Circle extends Instance {
  set size(size) {
    if (size.x_ !== size.y_) {
      if (size.y_ !== undefined) {
        ReportError(
          "The width of a circle should be the same with its height."); 
      }
      size.y_ = size.x_;
    }
    super.size = size;
  }
  get size() {return super.size;}
  ApplyProperties() {
    super.ApplyProperties();
    SetCss(this._tag_, "borderRadius", "50%");
  }
  Area() {return Math.PI*Math.pow(this.size.x_, 2);}
}
{
  let phyisical_instances = [];
  function InitPhyical(instance) {
    instance.phyisical = {};
    instance.phyisical.speed = 0;
  }
  setInterval(() => {
    phyisical_instances.forEach((instance) => {
      if (instance.phyisical === undefined) InitPhyical(instance);
      instance.phyisical.speed += 1;
      instance.position.y_ = Math.min(
        instance.position.y_ + instance.phyisical.speed,
        window.innerHeight - instance.size.y_);
      instance.ApplyProperties();
    });
  }, 1000 / 60);
  {
    let mousedown_position = new Point();
    let instance;
    let minimun_size = new Point(10, 10);
    document.addEventListener("mousedown", (event) => {
      if (instance !== undefined) instance.Destroy();
      instance = new Circle();
      instance.color = "rgb(" + 255*Math.random() + ", " +
                                255*Math.random() + ", " +
                                255*Math.random() + ")";
      mousedown_position.Set(event.pageX, event.pageY);
    });
    document.addEventListener("mousemove", (event) => {
      if (instance === undefined) return;
      let size = Math.max(
        Math.abs(event.pageX - mousedown_position.x_),
        Math.abs(event.pageY - mousedown_position.y_));
      instance.size = new Point(size);
      let position = new Point();
      position.Set(mousedown_position);
      if (mousedown_position.x_ > event.pageX) position.x_ -= size;
      if (mousedown_position.y_ > event.pageY) position.y_ -= size;
      instance.position = position;
      instance.ApplyProperties();
    });
    document.addEventListener("mouseup", () => {
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        phyisical_instances.push(instance);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
