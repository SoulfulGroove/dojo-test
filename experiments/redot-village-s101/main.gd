extends Node2D
## S101 mobile web proof: one courtyard, six hotspots, state-driven interaction.
## All positions use a fixed 960x540 virtual canvas and 15-pixel graph-paper units.

var has_cup := false
var cup_filled := false
var helped := false
var show_bounds := false
var elapsed := 0.0
var last_tap := -1000
var last_target := ""
var message_label: Label
var inventory_button: Button
var bounds_button: Button

const AREAS := {
    "Cup": Rect2(270, 360, 90, 82),
    "Well": Rect2(375, 285, 120, 120),
    "Villager": Rect2(510, 270, 90, 150),
    "Gate": Rect2(660, 165, 120, 150),
    "House": Rect2(75, 180, 270, 180),
    "Pond": Rect2(750, 345, 150, 90),
    "Lantern": Rect2(605, 305, 45, 95)
}

func _ready() -> void:
    _make_hud()
    _say("Tap the villager. Find the cup, fill it at the well, and help her.")
    _refresh_inventory()

func _process(delta: float) -> void:
    elapsed += delta
    queue_redraw()

func _draw() -> void:
    # Sky, hills, path and a traditional house; deliberately simple editable art.
    draw_rect(Rect2(0, 0, 960, 540), Color("#d3ece3"))
    draw_colored_polygon(PackedVector2Array([Vector2(0,220),Vector2(115,96),Vector2(290,220)]), Color("#a4c4b3"))
    draw_colored_polygon(PackedVector2Array([Vector2(195,220),Vector2(415,85),Vector2(675,230)]), Color("#b6d0bd"))
    draw_rect(Rect2(0, 238, 960, 204), Color("#86b48c"))
    draw_colored_polygon(PackedVector2Array([Vector2(312,442),Vector2(542,300),Vector2(651,300),Vector2(854,442)]), Color("#d8cbb0"))
    for i in range(14):
        draw_circle(Vector2(26 + i*75, 254 + sin(float(i))*12), 19, Color("#6e9e7a"))
    # House.
    draw_rect(Rect2(104,235,202,122), Color("#e2c99a"))
    draw_rect(Rect2(189,279,58,78), Color("#8a583f"))
    draw_rect(Rect2(118,273,45,48), Color("#b9d5c6"))
    draw_colored_polygon(PackedVector2Array([Vector2(75,238),Vector2(201,165),Vector2(342,238)]), Color("#795944"))
    for i in range(7):
        draw_line(Vector2(90 + i*39,236), Vector2(201,168),Color("#90704f",0.35),2)
    # Bamboo at left.
    for j in range(3):
        var x := 33.0 + j*22.0
        draw_line(Vector2(x,380),Vector2(x+8,161),Color("#3f8969"),9)
        for k in range(4):
            var y := 212.0 + k*38.0
            draw_line(Vector2(x+5,y),Vector2(x+45,y-28),Color("#4b936b"),6)
            draw_line(Vector2(x+5,y+6),Vector2(x-31,y-22),Color("#5b9971"),5)
    # Cherry tree; canopy gently sways.
    var sway := sin(elapsed*1.2)*2.5
    draw_line(Vector2(836,353),Vector2(832+sway,196),Color("#705342"),15)
    draw_line(Vector2(833,256),Vector2(883+sway,217),Color("#705342"),8)
    for p in [Vector2(800,191),Vector2(836,164),Vector2(867,185),Vector2(889,213),Vector2(810,226),Vector2(856,227)]:
        draw_circle(p + Vector2(sway,0),35,Color("#ebbbca"))
        draw_circle(p + Vector2(sway-9,3),20,Color("#f6d9df"))
    # Torii gate; cream highlights when the route is unlocked.
    var gate_color := Color("#d4a048") if helped else Color("#b84832")
    draw_rect(Rect2(676,203,14,112),gate_color)
    draw_rect(Rect2(750,203,14,112),gate_color)
    draw_rect(Rect2(655,190,130,17),gate_color)
    draw_rect(Rect2(668,217,103,12),gate_color)
    # Stone lantern.
    draw_rect(Rect2(619,339,14,45),Color("#b9b3a6"))
    draw_rect(Rect2(605,335,43,12),Color("#9f9990"))
    draw_rect(Rect2(613,310,26,27),Color("#b9b3a6"))
    draw_rect(Rect2(619,315,14,12),Color("#f2de89"))
    draw_colored_polygon(PackedVector2Array([Vector2(604,311),Vector2(627,295),Vector2(649,311)]),Color("#9f9990"))
    # Well and animated water glimmer.
    draw_rect(Rect2(397,313,77,81),Color("#928875"))
    draw_circle(Vector2(435,323),43,Color("#a6a49b"))
    draw_circle(Vector2(435,323),31,Color("#4c97aa"))
    draw_arc(Vector2(435,323),21,0.4,2.7,25,Color("#b6e4e0",0.50+0.45*sin(elapsed*2.0)),3)
    draw_line(Vector2(391,311),Vector2(398,273),Color("#745a44"),7)
    draw_line(Vector2(479,311),Vector2(472,273),Color("#745a44"),7)
    draw_line(Vector2(390,268),Vector2(481,268),Color("#745a44"),9)
    # Villager; head, body, arms.
    draw_circle(Vector2(551,303),21,Color("#e4ba9d"))
    draw_colored_polygon(PackedVector2Array([Vector2(538,324),Vector2(564,324),Vector2(588,404),Vector2(522,404)]),Color("#4f7280"))
    draw_line(Vector2(531,340),Vector2(506,364),Color("#e0ac93"),11)
    draw_line(Vector2(572,341),Vector2(591,362),Color("#e0ac93"),11)
    draw_arc(Vector2(551,297),21,3.1,6.1,18,Color("#483830"),8)
    draw_circle(Vector2(545,303),2,Color("#342d2b"))
    draw_circle(Vector2(558,303),2,Color("#342d2b"))
    # Wooden cup on the ground until it is picked up.
    if not has_cup and not helped:
        draw_rect(Rect2(306,400,26,21),Color("#97663b"))
        draw_rect(Rect2(305,396,28,6),Color("#c3955f"))
        draw_arc(Vector2(335,407),9,-1.3,1.3,18,Color("#b17d46"),4)
    # Pond shimmer.
    draw_circle(Vector2(813,398),39,Color("#80c4bd"))
    draw_circle(Vector2(855,401),33,Color("#80c4bd"))
    for k in range(3):
        var x := 783.0 + float(k)*33.0
        draw_line(Vector2(x,395+sin(elapsed*1.7+k)*4), Vector2(x+27,395+sin(elapsed*1.7+k)*4),Color("#d1ece2"),3)
    # A few grass tufts.
    for i in range(23):
        var x := float((i*83+21)%960)
        var y := float(355+(i*31)%80)
        draw_line(Vector2(x,y),Vector2(x-5,y-9),Color("#5e9c75",0.6),2)
        draw_line(Vector2(x,y),Vector2(x+4,y-11),Color("#5e9c75",0.6),2)
    if show_bounds:
        for name in AREAS.keys():
            if name == "Cup" and (has_cup or helped):
                continue
            draw_rect(AREAS[name],Color(0.1,0.95,0.55,0.17))
            draw_rect(AREAS[name],Color("#18ef85"),false,2)

func _input(event: InputEvent) -> void:
    var pos := Vector2(-1,-1)
    if event is InputEventScreenTouch and event.pressed:
        pos = event.position
    elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        pos = event.position
    if pos.x < 0 or pos.y >= 442:
        return
    for key in ["Cup","Well","Villager","Gate","House","Pond","Lantern"]:
        if key == "Cup" and (has_cup or helped):
            continue
        if AREAS[key].has_point(pos):
            var now := Time.get_ticks_msec()
            if last_target == key and now-last_tap < 260:
                return
            last_tap=now
            last_target=key
            _interact(key)
            get_viewport().set_input_as_handled()
            return

func _interact(key: String) -> void:
    match key:
        "Cup":
            has_cup=true
            _say("You pick up the wooden cup. It is now in your inventory.")
        "Well":
            if not has_cup:
                _say("The well contains clear water. Find a container.")
            elif not cup_filled:
                cup_filled=true
                _say("You fill the cup with water. The villager asked for something...")
            else:
                _say("The cup already contains water.")
        "Villager":
            if helped:
                _say("She smiles: 「ありがとう！」 Thank you. The gate is open.")
            elif cup_filled:
                helped=true
                cup_filled=false
                has_cup=false
                _say("You give her the water. 「ありがとう！」 The path opens! Tap the gate.")
            else:
                _say("She asks: 「みずを ください。」 Water, please.")
        "Gate":
            _say("S101 complete! You helped the villager. Next: scene S102." if helped else "The path is blocked. Perhaps someone here can help.")
        "House":
            _say("A thatched house. Someone is preparing breakfast inside.")
        "Pond":
            _say("The pond shimmers. A few koi move below the surface.")
        "Lantern":
            _say("An old stone lantern marks the path to the village.")
    _refresh_inventory()
    queue_redraw()

func _make_hud() -> void:
    var layer := CanvasLayer.new()
    add_child(layer)
    var top := ColorRect.new()
    top.color = Color(0.07,0.16,0.18,0.92)
    top.position=Vector2(14,14)
    top.size=Vector2(347,40)
    top.mouse_filter=Control.MOUSE_FILTER_IGNORE
    layer.add_child(top)
    var title := Label.new()
    title.text="S101  ·  Village Courtyard"
    title.position=Vector2(26,22)
    title.add_theme_font_size_override("font_size",19)
    title.mouse_filter=Control.MOUSE_FILTER_IGNORE
    layer.add_child(title)
    var bar := ColorRect.new()
    bar.color=Color(0.06,0.14,0.17,0.98)
    bar.position=Vector2(0,442)
    bar.size=Vector2(960,98)
    layer.add_child(bar)
    message_label=Label.new()
    message_label.position=Vector2(22,448)
    message_label.size=Vector2(916,45)
    message_label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
    message_label.add_theme_font_size_override("font_size",17)
    layer.add_child(message_label)
    inventory_button=_button(layer,Vector2(22,497),Vector2(430,37),"Inventory: empty")
    inventory_button.pressed.connect(func(): _say("Cup of water: offer it to the villager." if cup_filled else ("You have an empty cup. Try the well." if has_cup else "Your inventory is empty.")))
    bounds_button=_button(layer,Vector2(565,497),Vector2(216,37),"Show hitboxes")
    bounds_button.pressed.connect(_toggle_bounds)
    var restart := _button(layer,Vector2(796,497),Vector2(142,37),"Restart")
    restart.pressed.connect(_reset)

func _button(parent: Node, pos: Vector2, sz: Vector2, caption: String) -> Button:
    var b := Button.new()
    b.position=pos
    b.size=sz
    b.text=caption
    b.add_theme_font_size_override("font_size",16)
    parent.add_child(b)
    return b

func _say(content: String) -> void:
    message_label.text=content

func _refresh_inventory() -> void:
    inventory_button.text="Inventory: cup of water" if cup_filled else ("Inventory: wooden cup" if has_cup else "Inventory: empty")

func _toggle_bounds() -> void:
    show_bounds=not show_bounds
    bounds_button.text="Hide hitboxes" if show_bounds else "Show hitboxes"
    _say("Green outlines show the tappable areas." if show_bounds else "Hitboxes hidden.")
    queue_redraw()

func _reset() -> void:
    has_cup=false
    cup_filled=false
    helped=false
    last_tap=-1000
    last_target=""
    show_bounds=false
    bounds_button.text="Show hitboxes"
    _say("Tap the villager. Find the cup, fill it at the well, and help her.")
    _refresh_inventory()
    queue_redraw()
