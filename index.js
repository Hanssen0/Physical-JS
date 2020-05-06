function ReportError(err) {
  console.log(err);
}
class Tag {
  constructor(selector) {
    this._on_ = [];
    switch (typeof(selector)) {
    case "object":
      this._tag_ = selector;
      return;
    case "string":
      if (selector[0] === "#") {
        this._tag_ = document.getElementById(selector.substring(1));
      } else {
        this._tag_ = document.createElement(selector === "" ? "div" : selector);
      }
      return;
    default:
      this._tag_ = document.createElement("div");
      Tag.Body.Append(new Tag(this._tag_));
    }
  }
  Append(node) {
    this._tag_.appendChild(node._tag_);
  }
  Clone() {
    return new Tag(this._tag_.cloneNode(true));
  }
  HTML(value) {
    if (value === undefined) return this._tag_.innerHTML;
    this._tag_.innerHTML = value;
  }
  Get(selector) {
    this._tag_ = document.getElementById(selector);
  }
  Css(name, value) {
    if (value === undefined) return this._tag_.style[name];
    this._tag_.style[name] = value;
  }
  AddClass(class_name) {
    this._tag_.className += " " + class_name;
  }
  On(name, callback) {
    this._tag_.addEventListener(name, callback);
  }
  OnRemove(callback) {
    if (this._on_.remove === undefined) this._on_.remove = new Set();
    this._on_.remove.add(callback);
  }
  Remove() {
    this._tag_.remove();
    if (this._on_.remove !== undefined) this._on_.remove.forEach((v) => v());
  }
  MoveTo(pos) {
    this.Css("top", pos.y_ + "px"); this.Css("left", pos.x_ + "px");
  }
}
Tag.Document = new Tag(document);
Tag.Body = new Tag(document.body);
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
    return new Vector2D(this).MultiplyEqual(a);
  }
  MultiplyEqual(a) {
    this.x_ *= a;
    this.y_ *= a;
    return this;
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
class ComicText {
  constructor(content, random_move) {
    this._balloon_ = new Tag("");
    this._text_ = new Tag("");
    this._balloon_.AddClass("comic-balloon");
    this._text_.AddClass("comic-text");
    this._text_.HTML(content);
    this._random_move_ = random_move;
  }
  Apply(pos) {
    let rotate = new Tag("");
    Tag.Body.Append(rotate);
    rotate.MoveTo(pos);
    rotate.Css("transform", "rotate(" + (Math.random() - 0.5) + "rad)");
    let balloon_move = new Tag("");
    rotate.Append(balloon_move);
    let balloon = this._balloon_.Clone();
    balloon_move.Append(balloon);
    let text = this._text_.Clone();
    balloon.Append(text);
    balloon.On("animationend", () => {
      text.Remove();
      balloon.Remove();
      balloon_move.Remove();
      rotate.Remove();
    });
    if (this._random_move_ !== undefined) {
      this._random_move_.Add(balloon_move, 10, 2);
      this._random_move_.Add(text, 10, 2);
    }
  }
}
class Instance {
  constructor() {
    this._color_ = "#f0f";
    this._position_ = new Vector2D();
    this._size_ = new Vector2D();
    this._tag_ = new Tag();
  }
  set size(size) {this._size_ = size;}
  get size() {return this._size_;}
  set position(position) {this._position_ = position;}
  get position() {return this._position_;}
  set color(color) {this._color_ = color;}
  get tag() {return this._tag_;}
  ApplyProperties() {
    this._tag_.MoveTo(this.position);
    this._tag_.Css("width", this.size.x_ + "px");
    this._tag_.Css("height", this.size.y_ + "px");
    this._tag_.Css("backgroundColor", this._color_);
  }
  Area() {
    ReportError("The subclass doesn't implement Instance.Area() method.");
  }
  Destroy() {this._tag_.Remove();}
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
    this._tag_.Css("borderRadius", "50%");
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
    this._tag_.AddClass("physical");
  }
}
class Line {
  constructor() {
    this._tag_ = new Tag();
    this._visible_ = true;
    this._tag_.Css("transformOrigin", "top left");
    this._tag_.Css("width", "1px");
    this._show();
  }
  _hide() {
    this._tag_.Css("background", "");
  }
  _show() {
    this._tag_.Css("background", "#000");
  }
  Destroy() {
    this._tag_.Remove();
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
    this._tag_.Css("height", b.Length() + "px");
    this._tag_.MoveTo(a);
    this._tag_.Css("transform", "rotate(" + -Math.atan2(b.x_, b.y_) + "rad)");
  }
}
class ArrowLine {
  constructor() {
    this._tag_ = new Tag();
    this._line_ = new Line();
    this._visible_ = true;
    this._tag_.Css("transformOrigin", "top left");
    this._show();
  }
  _hide() {
    this._tag_.Css("borderTop", "");
    this._tag_.Css("borderLeft", "");
  }
  _show() {
    this._tag_.Css("borderTop", "#000 1px solid");
    this._tag_.Css("borderLeft", "#000 1px solid");
  }
  Destroy() {
    this._tag_.Remove();
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
    this._tag_.Css("width", Math.min(len/1.41, 10) + "px");
    this._tag_.Css("height", Math.min(len/1.41, 10) + "px");
    this._tag_.MoveTo(pos);
    this._tag_.Css("transform", "rotate(" + (-Math.PI*3/4 - Math.atan2(b.x_, b.y_)) + "rad)");
  }
}
class Physical {
  constructor(collision) {
    this._instances_ = [];
    this._collision_ = collision;
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
  static G() {return 1;}
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
      physical.speed.y_ += this.constructor.G();
      instance.position.PlusEqual(physical.speed);
      let execess = instance.position.y_ + instance.size.y_ - window.innerHeight;
      if (execess >= 0) {
        physical.speed.y_ -= this.constructor.G()*execess/physical.speed.y_;
        instance.position.y_ -= execess;
        let v = new Vector2D(0, physical.speed.y_);
        if (v.y_ > 5) {
          this._collision_.Apply(new Vector2D(instance.position.x_ + instance.Radius(), window.innerHeight - 60));
          let bang = new Audio("assets/bang.wav");
          bang.volume = Math.min(v.y_ * instance.Area() / 10000000, 1);
          bang.play();
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
            this._collision_.Apply(center);
            let bang = new Audio("assets/bang.wav");
            bang.volume = Math.min(relative_speed * ins.Area() * instance.Area() / 1000000000000, 1);
            bang.play();
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
class RandomMove {
  constructor() {
    this._instances_ = new Set();
    this._gap_ = 0;
  }
  static RandomDirection() {
    let r = 2*Math.PI*Math.random();
    return new Vector2D(Math.cos(r), Math.sin(r));
  }
  Add(tag, free, max) {
    let instance = {
      pos: new Vector2D(0, 0),
      speed: new Vector2D(0, 0),
      free: free,
      max: max,
      tag: tag
    };
    this._instances_.add(instance);
    tag.OnRemove(() => this._instances_.delete(instance));
  }
  Tick() {
    this._instances_.forEach((v) => {
      v.tag.Css("transform", "translate(" + v.pos.x_ + "px, " + v.pos.y_ + "px)");
      let a = this.constructor.RandomDirection().Multiply(v.max*Math.random());
      if (v.pos.Length() > v.free) a.PlusEqual(v.pos.Multiply(-0.5*v.max));
      v.speed.PlusEqual(a);
      if (v.speed.Length() > v.max) v.speed = v.speed.ScaleTo(v.max);
      v.pos.PlusEqual(v.speed);
    });
  }
}
{
  let rm = new RandomMove();
  let collision_comic = new ComicText("BANG!!!", rm);
  let physical = new Physical(collision_comic);
  {
    let physical_thread = setInterval(() => {
      physical.Tick();
      rm.Tick();
    }, 1000/60);
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
    let start;
    let previous;
    let click_audio = new Audio("assets/click.wav");
    let release_audio = new Audio("assets/release.wav");
    let down_comic = new ComicText("CLICK!!!", rm);
    Tag.Document.On("mousedown", (event) => {
      down_comic.Apply(new Vector2D(event.pageX, event.pageY));
      click_audio.play();
      previous = Date.now();
      start = previous;
      if (instance !== undefined) instance.Destroy();
      instance = new Circle();
      instance.color = "rgb(" + 255*Math.random() + ", " +
                                255*Math.random() + ", " +
                                255*Math.random() + ")";
      mousedown_position.Set(event.pageX, event.pageY);
    });
    let backgrounds = [
      new Tag("#Background-1"),
      new Tag("#Background-2"),
      new Tag("#Background-3"),
      new Tag("#Background-4"),
      new Tag("#Background-5"),
      new Tag("#Background-6"),
      new Tag("#Background-7")
    ];
    backgrounds.forEach((v) => rm.Add(v, 3, 0.1));
    Tag.Document.On("mousemove", (event) => {
      let ratio = 0.2;
      backgrounds.forEach((v) => {
        v.MoveTo(new Vector2D(event.pageX, event.pageY).Minus(new Vector2D(window.innerWidth/2, window.innerHeight/2)).Multiply(ratio));
        ratio *= 0.618;
      });
    });
    let move_comic = new ComicText("Sss...", rm);
    Tag.Document.On("mousemove", (event) => {
      if (instance === undefined) return;
      if (Date.now() - previous >= 200) {
        previous = Date.now();
        move_comic.Apply(new Vector2D(event.pageX, event.pageY));
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
    let up_comic = new ComicText("CLICK!!!", rm);
    Tag.Document.On("mouseup", () => {
      if (Date.now() - start >= 100) {
        release_audio.play();
        up_comic.Apply(new Vector2D(event.pageX, event.pageY));
      }
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        physical.Add(instance);
        let isolate = new Tag("");
        let ani = new Tag("");
        let ani1 = new Tag("");
        let ani2 = new Tag("");
        isolate.AddClass("isolation");
        ani.AddClass("physical-border-1");
        ani1.AddClass("physical-border-2");
        ani2.AddClass("physical-border-3");
        instance.tag.Append(isolate);
        isolate.Append(ani);
        isolate.Append(ani1);
        isolate.Append(ani2);
        rm.Add(ani, 8, 0.2);
        rm.Add(ani1, 8, 0.2);
        rm.Add(ani2, 8, 0.2);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
