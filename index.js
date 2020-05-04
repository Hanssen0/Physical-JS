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
function AddClass(tag, class_name) {
  tag.className += " " + class_name;
}
function On(tag, event_name, callback) {
  tag.addEventListener(event_name, callback);
}
function Remove(tag) {
  tag.remove();
}
class Vector2D {
  constructor(x, y) {
    this.Set(x, y);
  }
  Cross(a) {
    return a.y_*this.x_ - a.x_*this.y_;
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
    AddClass(this._tag_, "physical");
  }
}
class Line {
  constructor() {
    this._tag_ = CreateTag();
    this._visible_ = true;
    SetCss(this._tag_, "transformOrigin", "top left");
    SetCss(this._tag_, "width", "1px");
    this._show();
  }
  _hide() {
    SetCss(this._tag_, "background", "");
  }
  _show() {
    SetCss(this._tag_, "background", "#000");
  }
  Destroy() {
    Remove(this._tag_);
  }
  Hide() {
    this._visible_ = false;
    this._hide();
  }
  Show() {
    this._visible_ = true;
    this._show();
  }
  To(a, b) {
    if (!this._visible_) return;
    this._show();
    if (b.Length() < 1) {
      this._hide();
      return;
    }
    SetCss(this._tag_, "height", b.Length() + "px");
    SetCss(this._tag_, "top", a.y_ + "px");
    SetCss(this._tag_, "left", a.x_ + "px");
    SetCss(this._tag_, "transform", "rotate(" + -Math.atan2(b.x_, b.y_) + "rad)");
  }
}
class ArrowLine {
  constructor() {
    this._tag_ = CreateTag();
    this._line_ = new Line();
    this._visible_ = true;
    SetCss(this._tag_, "transformOrigin", "top left");
    this._show();
  }
  _hide() {
    SetCss(this._tag_, "borderTop", "");
    SetCss(this._tag_, "borderLeft", "");
  }
  _show() {
    SetCss(this._tag_, "borderTop", "#000 1px solid");
    SetCss(this._tag_, "borderLeft", "#000 1px solid");
  }
  Destroy() {
    Remove(this._tag_);
    this._line_.Destroy();
  }
  Hide() {
    this._visible_ = false;
    this._line_.Hide();
    this._hide();
  }
  Show() {
    this._visible_ = true;
    this._line_.Show();
    this._show();
  }
  To(a, b) {
    if (!this._visible_) return;
    this._show();
    this._line_.To(a, b);
    let len = b.Length();
    if (b.Length() < 1) {
      this._hide();
      return;
    }
    let pos = a.Plus(b);
    SetCss(this._tag_, "width", Math.min(len/1.41, 10) + "px");
    SetCss(this._tag_, "height", Math.min(len/1.41, 10) + "px");
    SetCss(this._tag_, "top", pos.y_ + "px");
    SetCss(this._tag_, "left", pos.x_ + "px");
    SetCss(this._tag_, "transform", "rotate(" + (-Math.PI*3/4 - Math.atan2(b.x_, b.y_)) + "rad)");
  }
}
let g = 1;
class Physical {
  constructor() {
    this._instances_ = [];
  }
  Add(instance) {
    instance.ToReal();
    this._instances_.push({
      instance: instance,
      speed: new Vector2D(0, 0),
      speed_line: new ArrowLine()
    });
  }
  Clear() {
    this._instances_.forEach((physical) => {
      physical.speed_line.Destroy();
      physical.instance.Destroy();
    });
    this._instances_ = [];
  }
  static Collision(v1, v2, m1, m2) {
    if (m1 === undefined) return [v1, v2.Multiply(-1)];
    if (m2 === undefined) return [v1.Multiply(-1), v2];
    let m1_plus_m2 = m1 + m2;
    return [
      v1.Multiply((m1 - m2)/m1_plus_m2).Plus(v2.Multiply(2*m2/m1_plus_m2)),
      v1.Multiply(2*m1/m1_plus_m2).Plus(v2.Multiply((m2 - m1)/m1_plus_m2))];
  }
  Tick() {
    this._instances_.forEach((physical, index) => {
      let instance = physical.instance;
      physical.speed.y_ += g;
      instance.position.PlusEqual(physical.speed);
      let execess = instance.position.y_ + instance.size.y_ - window.innerHeight;
      if (execess >= 0) {
        physical.speed.y_ -= g*execess/physical.speed.y_;
        instance.position.y_ -= execess;
        let v = new Vector2D(0, physical.speed.y_);
        if (v.y_ > 5) {
          AniTag(instance.position.x_ + instance.Radius(), window.innerHeight - 60, "BANG!!!");
        }
        physical.speed.MinusEqual(v).PlusEqual(this.constructor.Collision(v, undefined, instance.Area(), undefined)[0].Multiply(0.8));
      }
      for (let i = 0; i < index; ++i) {
        let phy = this._instances_[i];
        let ins = phy.instance;
        if (instance.IsCollided(ins)) {
          let center_fix = ins.Radius() - instance.Radius();
          let distance = ins.position.Minus(instance.position).Plus(center_fix);
          let direction = distance.ScaleTo(1);
          instance.position = 
            ins.position.Minus(
              direction.Multiply(instance.Radius() + ins.Radius())
            ).Plus(center_fix);
          let v1 =
            direction.Multiply(physical.speed.Dot(direction));
          let v2 = direction.Multiply(phy.speed.Dot(direction));
          let relative_speed = v1.Plus(v2).Dot(direction);
          if (relative_speed <= 0) continue;
          if (relative_speed > 5) {
            let center =
              instance.position
                .Plus(instance.Radius())
                .Plus(distance.ScaleTo(instance.Radius()));
            AniTag(Math.floor(center.x_), Math.floor(center.y_), "BANG!!!");
          }
          let speeds = this.constructor.Collision(v1, v2, instance.Area(), ins.Area());
          physical.speed.MinusEqual(v1).PlusEqual(speeds[0]);
          phy.speed.MinusEqual(v2).PlusEqual(speeds[1]);
        }
      }
    });
    this._instances_.forEach((physical) => {
      physical.instance.ApplyProperties();
      physical.speed_line.To(physical.instance.position.Plus(physical.instance.Radius()), physical.speed.Multiply(10));
    });
  }
}
function AniTag(x, y, content) {
  let rotate = CreateTag();
  AddClass(rotate, "CCR");
  SetCss(rotate, "left", x + "px");
  SetCss(rotate, "top", y + "px");
  SetCss(rotate, "transform", "rotate(" + (Math.random() - 0.5) + "rad)");
  let ani = CreateTag();
  rotate.appendChild(ani);
  ani.innerHTML = content;
  AddClass(ani, "CC");
  ani.removed = false;
  On(ani, "animationend", () => {
    Remove(rotate);
    Remove(ani);
    ani.removed = true;
  });
  return ani;
}
{
  let physical = new Physical();
  {
    let physical_thread = setInterval(() => physical.Tick(), 1000/60);
    const pause_image = "assets/pause.svg";
    const play_image = "assets/play_arrow.svg";
    let physical_switch = document.getElementById("PhysicalSwitch");
    let physical_switch_image =
      document.getElementById("PhysicalSwitch-Image");
    physical_switch_image.src = pause_image;
    physical_switch.addEventListener("click", () => {
      if (physical_thread === undefined) {
        physical_switch_image.src = pause_image;
        physical_thread = setInterval(() => physical.Tick(), 1000/60);
      } else {
        physical_switch_image.src = play_image;
        clearInterval(physical_thread);
        physical_thread = undefined;
      }
    });
    let clear_button = document.getElementById("ClearButton");
    clear_button.addEventListener("click", () => physical.Clear());
  }
  {
    let mousedown_position = new Vector2D();
    let instance;
    let minimun_size = new Vector2D(10, 10);
    let previous;
    document.addEventListener("mousedown", (event) => {
      AniTag(event.pageX, event.pageY, "CLICK!!!");
      previous = Date.now();
      if (instance !== undefined) instance.Destroy();
      instance = new Circle();
      instance.color = "rgb(" + 255*Math.random() + ", " +
                                255*Math.random() + ", " +
                                255*Math.random() + ")";
      mousedown_position.Set(event.pageX, event.pageY);
    });
    document.addEventListener("mousemove", (event) => {
      if (instance === undefined) return;
      if (Date.now() - previous >= 200) {
        previous = Date.now();
        AniTag(event.pageX, event.pageY, "Sss...");
      }
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
      AniTag(event.pageX, event.pageY, "CLICK!!!");
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        physical.Add(instance);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
