let kTexts = [
  ["CLICK!!!", "Sss...", "CLICK!!!", "Boom!!!"],
  ["哒!!!", "咻...", "哒!!!", "砰!!!"]
];
function ReportError(err) {
  console.log(err);
}
function GetClientVector(event) {
  return new Vector2D(event.clientX, event.clientY);
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
  Attribute(name, value) {
    if (value === undefined) return this._tag_[name];
    this._tag_[name] = value;
  }
  SetClass(class_name) {
    this._tag_.className = class_name;
  }
  AddClass(class_name) {
    this._tag_.className += " " + class_name;
  }
  On(name, callback) {
    this._tag_.addEventListener(name, callback);
  }
  OnClick(callback) {
    this.On(
      "click",
      (event) => callback(GetClientVector(event), event));
  }
  OnMouseDown(callback) {
    this.On(
      "mousedown",
      (event) => callback(GetClientVector(event), event));
  }
  OnMouseMove(callback) {
    this.On(
      "mousemove",
      (event) => callback(GetClientVector(event), event));
  }
  OnMouseUp(callback) {
    this.On(
      "mouseup",
      (event) => callback(GetClientVector(event), event));
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
  Hide() {
    this._display_ = this.Css("display");
    if (this._display_ === "none") this._display_ = "block";
    this.Css("display", "none");
    if (this._on_.hide !== undefined) {
      this._on_.hide.forEach((v) => v());
      this._on_.hide.clear();
    }
  }
  Show() {
    if (this._display_ === undefined) this._display_ = "block";
    this.Css("display", this._display_);
  }
  OnHide(callback) {
    if (this._on_.hide === undefined) this._on_.hide = new Set();
    this._on_.hide.add(callback);
  }
  RestartAnimation() {
    this.Css("animation", "none");
    this._tag_.offsetHeight;
    this.Css("animation", null);
  }
  PositionTo(father) {
    if (father === undefined) {
      let bound = this._tag_.getBoundingClientRect();
      return new Vector2D(bound.left, bound.top);
    }
    return this.PositionTo().MinusEqual(father.PositionTo());
  }
  ClientSize() {
    let bound = this._tag_.getBoundingClientRect();
    return new Vector2D(bound.right - bound.left, bound.bottom - bound.top);
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
  GetData() {
    return [this.x_, this.y_];
  }
  LoadData(data) {
    this.Set(data[0], data[1]);
  }
}
function InsidePolygon(point, polygon) {
  if (polygon.length < 3) return false;
  let count = 0;
  let x = point.x_;
  let y = point.y_;
  for (let i = 0; i < polygon.length; ++i) {
    let now = polygon[i];
    let pre = polygon[(i === 0 ? polygon.length : i) - 1];
    if (pre.x_ > x && now.x_ > x) {
      if (((pre.y_ - y)*(now.y_ - y)) < 0) ++count;
    } else if ((pre.x_ - x)*(now.x_ - x) < 0) {
      if ((pre.x_ - y)*(now.y_ - y) < 0) {
        if (pre.x_ + (y - pre.y_)*(now.x_- pre.x_)/(now.y_ - pre.y_) > x) ++count;
      }
    }
  }
  return count%2 !== 0;
}
function RandomDirection() {
  let r = 2*Math.PI*Math.random();
  return new Vector2D(Math.cos(r), Math.sin(r));
}
/* function RandomVector(min, max) {
  let l = min + (max - min)*Math.random();
  return RandomDirection().MultiplyEqual(l);
} */
class ComicText {
  constructor(content, random_move) {
    this._rotate_ = new Tag("");
    this._balloon_ = new Tag("");
    this._text_ = new Tag("");
    this._rotate_.AddClass("comic-main");
    this._balloon_.AddClass("comic-balloon");
    this._text_.AddClass("comic-text");
    this._text_.HTML(content);
    this._random_move_ = random_move;
    this._pool_ = [];
  }
  Apply(pos) {
    let rotate;
    let balloon_move;
    let text;
    if (this._pool_.length === 0) {
      rotate = this._rotate_.Clone();
      Tag.Body.Append(rotate);
      balloon_move = new Tag("");
      rotate.Append(balloon_move);
      let balloon = this._balloon_.Clone();
      balloon_move.Append(balloon);
      text = this._text_.Clone();
      balloon.Append(text);
      balloon.On("animationend", () => {
        this._pool_.push([rotate, balloon_move, balloon, text]);
        rotate.Hide();
      });
    } else {
      let saved = this._pool_.pop();
      rotate = saved[0];
      balloon_move = saved[1];
      text = saved[3];
      text.HTML(this._text_.HTML());
      saved[2].RestartAnimation();
      rotate.Show();
    }
    rotate.MoveTo(pos);
    rotate.Css("transform", "rotate(" + (Math.random() - 0.5) + "rad)");
    if (this._random_move_ !== undefined) {
      rotate.OnHide(this._random_move_.Add(balloon_move, 10, 2));
      rotate.OnHide(this._random_move_.Add(text, 10, 2));
    }
  }
  Set(content) {this._text_.HTML(content);}
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
  get color() {return this._color_;}
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
  GetData() {
    ReportError("The subclass doesn't implement Instance.GetData() method.");
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
  GetData() {
    return {
      type: "circle",
      radius: super.size.x_,
      position: super.position.GetData(),
      color: super.color
    };
  }
}
function InstanceFactory(data) {
  let ins;
  switch (data.type) {
  case "circle":
    ins = new Circle();
    ins.position.LoadData(data.position);
    ins.size = new Vector2D(data.radius);
    ins.color = data.color;
    return ins;
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
    this._on_ = [];
  }
  OnAdd(callback) {
    if (this._on_.add === undefined) this._on_.add = new Set();
    this._on_.add.add(callback);
  }
  Add(instance, speed) {
    instance.ToReal();
    if (speed === undefined) speed = new Vector2D(0, 0);
    this._instances_.push({
      instance: instance,
      speed: speed,
      speed_line: new ArrowLine(),
    });
    if (this._on_.add !== undefined) this._on_.add.forEach((v) => v(instance));
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
  GetData() {
    let data = [];
    this._instances_.forEach((v) => {
      data.push({
        instance: v.instance.GetData(),
        speed: v.speed.GetData()
      });
    });
    return data;
  }
  LoadData(data) {
    this.Clear();
    data.forEach((v) => {
      let speed = new Vector2D();
      speed.LoadData(v.speed);
      let instance = InstanceFactory(v.instance);
      this.Add(instance, speed);
      instance.ApplyProperties();
    });
  }
}
class RandomMove {
  constructor() {
    this._instances_ = new Set();
    this._gap_ = 0;
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
    return () => this._instances_.delete(instance);
  }
  Tick() {
    this._instances_.forEach((v) => {
      v.tag.Css("transform", "translate(" + v.pos.x_ + "px, " + v.pos.y_ + "px)");
      let a = RandomDirection().Multiply(v.max*Math.random());
      if (v.pos.Length() > v.free) a.PlusEqual(v.pos.Multiply(-0.5*v.max));
      v.speed.PlusEqual(a);
      if (v.speed.Length() > v.max) v.speed = v.speed.ScaleTo(v.max);
      v.pos.PlusEqual(v.speed);
    });
  }
}
class SaveHexagon {
  constructor(tag) {
    this._tag_ = tag;
  }
  Active(content) {
    this._tag_.AddClass("saves-list-hexagon-active");
    this._tag_.HTML(content);
  }
  Deactive() {
    this._tag_.SetClass("saves-list-hexagon");
  }
  IsInside(mouse) {
    let size = this._tag_.ClientSize();
    let position = mouse.MinusEqual(this._tag_.PositionTo(Tag.Body));
    let points = [];
    let center = size.Multiply(0.5);
    for (let i = 0; i < 6; ++i) {
      let r = i*Math.PI/3;
      let point = new Vector2D(Math.cos(r), Math.sin(r)).MultiplyEqual(size.x_/2);
      points.push(point.PlusEqual(center));
    }
    return InsidePolygon(position, points);
  }
}
class HexagonsList {
  constructor(start_row, end_row, start_column, end_column) {
    this._area_ = [start_row, end_row, start_column, end_column];
    this._current_ = new Vector2D(start_row, start_column);
  }
  Add(content, click) {
    let rows = document.getElementsByClassName("hexagon-row");
    let items = rows[this._current_.x_].getElementsByClassName("saves-list-hexagon");
    let item = new SaveHexagon(new Tag(items[this._current_.y_]));
    if (++this._current_.y_ > this._area_[3]) {
      this._current_.y_ = this._area_[2];
      if (++this._current_.x_ > this._area_[1]) {
        this._current_.x_ = this._area_[0];
      }
    }
    Tag.Body.OnClick((pos) => {
      if (item.IsInside(pos)) click();
    });
    item.Active(content);
  }
}
let language_callbacks = new Set();
function OnLanguageChange(callback) {
  language_callbacks.add(callback);
}
{
  let rm = new RandomMove();
  let collision_comic = new ComicText("BANG!!!", rm);
  OnLanguageChange((stat) => collision_comic.Set(kTexts[stat][3]));
  let physical = new Physical(collision_comic);
  physical.OnAdd((instance) => {
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
    rm.Add(ani, 6, 0.2);
    rm.Add(ani1, 6, 0.2);
    rm.Add(ani2, 6, 0.2);
    instance.tag.OnRemove(() => {
      ani.Remove();
      ani1.Remove();
      ani2.Remove();
      isolate.Remove();
    });
  });
  {
    let sample_down = 0;
    let CalculationHandler = () => {
      physical.Tick();
      if (++sample_down < 2) return;
      sample_down = 0;
      rm.Tick();
    };
    let physical_thread = setInterval(CalculationHandler, 1000/60);
    const pause_image = "assets/pause.svg";
    const play_image = "assets/play_arrow.svg";
    let physical_switch = new Tag("#PhysicalSwitch");
    let physical_switch_image = new Tag("#PhysicalSwitch-Image");
    physical_switch_image.Attribute("src", pause_image);
    physical_switch.On("click", () => {
      if (physical_thread === undefined) {
        physical_switch_image.Attribute("src", pause_image);
        physical_thread = setInterval(CalculationHandler, 1000/60);
      } else {
        physical_switch_image.Attribute("src", play_image);
        clearInterval(physical_thread);
        physical_thread = undefined;
      }
    });
    let clear_button = new Tag("#ClearButton");
    clear_button.On("click", () => physical.Clear());
    let language = 0;
    let language_button = new Tag("#LanguageButton");
    language_button.On("click", () => {
      language = language === 0 ? 1 : 0;
      language_callbacks.forEach((v) => v(language));
    });
    let save_button = new Tag("#SaveButton");
    let hl = new HexagonsList(2, 4, 2, 7);
    let number = 0;
    save_button.On("click", () => {
      let data = physical.GetData();
      hl.Add(number++, () => physical.LoadData(data));
    });
    let menu_button = new Tag("#MenuButton");
    let saves_list = new Tag("#SavesList");
    let has_shown = false;
    menu_button.OnClick(() => {
      if (has_shown) {
        saves_list.Hide();
      } else {
        saves_list.Show();
      }
      has_shown = !has_shown;
    });
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
    OnLanguageChange((stat) => down_comic.Set(kTexts[stat][0]));
    Tag.Body.OnMouseDown((pos) => {
      down_comic.Apply(pos);
      click_audio.play();
      previous = Date.now();
      start = previous;
      if (instance !== undefined) instance.Destroy();
      instance = new Circle();
      instance.color = "rgb(" + 255*Math.random() + ", " +
                                255*Math.random() + ", " +
                                255*Math.random() + ")";
      mousedown_position.Set(pos);
    });
    let backgrounds = [
      new Tag("#Background-1-Move"),
      new Tag("#Background-2-Move"),
      new Tag("#Background-3-Move"),
      new Tag("#Background-4-Move"),
      new Tag("#Background-5-Move"),
      new Tag("#Background-6-Move"),
      new Tag("#Background-7-Move")
    ];
    backgrounds.forEach((v) => rm.Add(v, 6, 0.2));
    Tag.Body.OnMouseMove((pos) => {
      let ratio = 0.2;
      backgrounds.forEach((v) => {
        v.MoveTo(pos.Minus(new Vector2D(window.innerWidth/2, window.innerHeight/2)).Multiply(ratio));
        ratio += (0.5-ratio)*0.382;
      });
    });
    let move_comic = new ComicText("Sss...", rm);
    OnLanguageChange((stat) => move_comic.Set(kTexts[stat][1]));
    Tag.Body.OnMouseMove((pos) => {
      if (instance === undefined) return;
      if (Date.now() - previous >= 200) {
        previous = Date.now();
        move_comic.Apply(pos);
      }
      let size = Math.max(
        Math.abs(pos.x_ - mousedown_position.x_),
        Math.abs(pos.y_ - mousedown_position.y_));
      instance.size = new Vector2D(size);
      let position = new Vector2D();
      position.Set(mousedown_position);
      if (mousedown_position.x_ > pos.x_) position.x_ -= size;
      if (mousedown_position.y_ > pos.y_) position.y_ -= size;
      instance.position = position;
      instance.ApplyProperties();
    });
    let up_comic = new ComicText("CLICK!!!", rm);
    OnLanguageChange((stat) => up_comic.Set(kTexts[stat][2]));
    Tag.Body.OnMouseUp((pos) => {
      if (Date.now() - start >= 250) {
        release_audio.play();
        up_comic.Apply(pos);
      }
      if (instance.size !== undefined && instance.size.IsBigger(minimun_size)) {
        physical.Add(instance);
      } else {
        instance.Destroy();
      }
      instance = undefined;
    });
  }
}
