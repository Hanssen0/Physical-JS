function ReportError(err) {
  console.log(err);
}
function CreateTag() {
  let div = document.createElement("div");
  document.body.append(div);
  return div;
}
function SetCss(tag, name, value) {
  tag.style[name] = value;
}
class Vector2D {
  constructor(x, y) {
    this.Set(x, y);
  }
  Dot(a) {
    return a.x_*this.x_ + a.y_*this.y_;
  }
  IsBigger(b) {
    return this.x_ > b.x_ && this.y_ > b.y_;
  }
  Length() {
    return Math.sqrt(this.Square());
  }
  Minus(b) {
    return new Vector2D(this).MinusEqual(b);
  }
  MinusEqual(b) {
    if (typeof(b) === "number") {
      this.x_ -= b;
      this.y_ -= b;
    } else {
      this.x_ -= b.x_;
      this.y_ -= b.y_;
    }
    return this;
  }
  Multiply(a) {
    return new Vector2D(a*this.x_, a*this.y_);
  }
  Plus(b) {
    return new Vector2D(this).PlusEqual(b);
  }
  PlusEqual(b) {
    if (typeof(b) === "number") {
      this.x_ += b;
      this.y_ += b;
    } else {
      this.x_ += b.x_;
      this.y_ += b.y_;
    }
    return this;
  }
  ScaleTo(n) {
    let scale = n/this.Length();
    return new Vector2D(scale*this.x_, scale*this.y_);
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
  Square() {
    return Math.pow(this.x_, 2) + Math.pow(this.y_, 2);
  }
}
class Instance {
  constructor() {
    this._color_ = "#f0f";
    this._position_ = new Vector2D();
    this._size_ = new Vector2D();
    this._tag_ = CreateTag();
  }
  set size(size) {this._size_ = size;}
  get size() {return this._size_;}
  set position(position) {this._position_ = position;}
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
  IsCollided() {
    ReportError("The subclass doesn't implement Instance.IsCollided() method.");
  }
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
  IsCollided(instance) {
    switch (instance.constructor.name) {
    case "Circle": 
      return this.position
        .Minus(instance.position)
        .Plus((this.size.x_ - instance.size.x_)/2).Square() <
          Math.pow((this.size.x_ + instance.size.x_)/2, 2);
    }
  }
  Radius() {
    return this.size.x_/2;
  }
  ToReal() {
    SetCss(this._tag_, "box-shadow",  "0 0 10px rgba(20, 20, 20, 0.3), 0 5px 10px rgba(20, 20, 20, 0.3)");
  }
}
function Collision(v1, v2, m1, m2) {
  if (m1 === undefined) return [v1, v2.Multiply(-1)];
  if (m2 === undefined) return [v1.Multiply(-1), v2];
  let m1_plus_m2 = m1 + m2;
  return [
    v1.Multiply((m1 - m2)/m1_plus_m2).Plus(v2.Multiply(2*m2/m1_plus_m2)),
    v1.Multiply(2*m1/m1_plus_m2).Plus(v2.Multiply((m2 - m1)/m1_plus_m2))];
}
{
  let physical_instances = [];
  function InitPhysical(instance) {
    instance.physical = {};
    instance.physical.speed = new Vector2D(0, 0);
  }
  let g = 1;
  let physical_thread;
  {
    let PhysicalHandler = () => {
      physical_instances.forEach((instance, index) => {
        if (instance.physical === undefined) InitPhysical(instance);
        instance.physical.speed.y_ += g;
        instance.position.PlusEqual(instance.physical.speed);
        let execess = instance.position.y_ + instance.size.y_ - window.innerHeight;
        if (execess >= 0) {
          instance.physical.speed.y_ -= g*execess/instance.physical.speed.y_;
          instance.position.y_ -= execess;
          let v = new Vector2D(0, instance.physical.speed.y_);
          instance.physical.speed.MinusEqual(v).PlusEqual(Collision(v, undefined, instance.Area(), undefined)[0].Multiply(0.8));
        }
        for (let i = 0; i < index; ++i) {
          let ins = physical_instances[i];
          if (instance.IsCollided(ins)) {
            let center_fix = ins.Radius() - instance.Radius();
            let distance = ins.position.Minus(instance.position).Plus(center_fix);
            let direction = distance.ScaleTo(1);
            instance.position = 
              ins.position.Minus(
                direction.Multiply(instance.Radius() + ins.Radius())
              ).Plus(center_fix);
            let v1 =
              direction.Multiply(instance.physical.speed.Dot(direction));
            let v2 = direction.Multiply(ins.physical.speed.Dot(direction));
            if (v1.Plus(v2).Dot(direction) <= 0) continue;
            let speeds = Collision(v1, v2, instance.Area(), ins.Area());
            instance.physical.speed.MinusEqual(v1).PlusEqual(speeds[0]);
            ins.physical.speed.MinusEqual(v2).PlusEqual(speeds[1]);
          }
        }
      });
      physical_instances.forEach((instance) => instance.ApplyProperties());
    };
    physical_thread = setInterval(PhysicalHandler, 1000/60);
    const pause_image = "assets/pause.svg";
    const play_image = "assets/play_arrow.svg";
    let physical_switch = document.getElementById("PhysicalSwitch");
    let physical_switch_image =
      document.getElementById("PhysicalSwitch-Image");
    physical_switch_image.src = pause_image;
    physical_switch.addEventListener("click", () => {
      if (physical_thread === undefined) {
        physical_switch_image.src = pause_image;
        physical_thread = setInterval(PhysicalHandler, 1000/60);
      } else {
        physical_switch_image.src = play_image;
        clearInterval(physical_thread);
        physical_thread = undefined;
      }
    });
    let clear_button = document.getElementById("ClearButton");
    clear_button.addEventListener("click", () => {
      let instances = physical_instances;
      physical_instances = [];
      instances.forEach((instance) => instance.Destroy());
    });
  }
  {
    let mousedown_position = new Vector2D();
    let instance;
    let minimun_size = new Vector2D(10, 10);
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
      instance.size = new Vector2D(size);
      let position = new Vector2D();
      position.Set(mousedown_position);
      if (mousedown_position.x_ > event.pageX) position.x_ -= size;
      if (mousedown_position.y_ > event.pageY) position.y_ -= size;
      instance.position = position;
      instance.ApplyProperties();
    });
    document.addEventListener("mouseup", () => {
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        instance.ToReal();
        physical_instances.push(instance);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
