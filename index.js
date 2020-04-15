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
  #position_;
  #size_;
  #color_;
  #tag_;
  constructor() {
    this.color_ = "#f0f";
    this.position_;
    this.size_;
    this.tag_ = CreateTag();
  }
  set size(size) {this.size_ = size;}
  get size() {return this.size_;}
  set position(position) {this.position_ = position;}
  get position() {return this.position_;}
  set color(color) {this.color_ = color;}
  ApplyProperties() {
    SetCss(this.tag_, "left", this.position_.x_ + "px");
    SetCss(this.tag_, "top", this.position_.y_ + "px");
    SetCss(this.tag_, "width", this.size_.x_ + "px");
    SetCss(this.tag_, "height", this.size_.y_ + "px");
    SetCss(this.tag_, "backgroundColor", this.color_);
  }
  Area() {
    ReportError("The subclass doesn't implement Instance.Area() method.");
  }
  Destroy() {this.tag_.remove();}
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
    this.size_ = size;
  }
  get size() {return super.size;}
  ApplyProperties() {
    super.ApplyProperties();
    SetCss(this.tag_, "borderRadius", "50%");
  }
  Area() {return Math.PI*Math.pow(size_.x_, 2);}
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
      mousedown_position.x_ = event.pageX;
      mousedown_position.y_ = event.pageY;
    });
    document.addEventListener("mousemove", (event) => {
      if (instance === undefined) return;
      let size = Math.max(Math.abs(event.pageX - mousedown_position.x_),
                          Math.abs(event.pageY - mousedown_position.y_))
      instance.size = new Point(size);
      let position = new Point();
      position.Set(mousedown_position);
      if (mousedown_position.x_ > event.pageX) position.x_ -= size;
      if (mousedown_position.y_ > event.pageY) position.y_ -= size;
      instance.position = position;
      instance.ApplyProperties();
    });
    document.addEventListener("mouseup", (event) => {
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        phyisical_instances.push(instance);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
