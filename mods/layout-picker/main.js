// Layout picker: lists every layout, marks the one showing, switches on click or Enter.
// ↑/↓ to move, Esc to leave. Bind it in keys.json: "cmd-shift-l": "mod.open:layout-picker".
import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { layouts, shared, run, theme, props, closeOverlay } from "herdr";

export default class LayoutPicker extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.at = null;
    // The popup takes a moment to become focusable, as in the shipped picker.
    cx.timer.after(50, () => this.handle.focus());
  }

  close() {
    closeOverlay(props().overlay);
  }

  go(name) {
    this.close();
    if (name !== shared("layout")) run("layout.switch", { name });
  }

  render() {
    const t = theme();
    const names = [...(layouts() ?? [])].sort();
    const current = shared("layout");
    if (this.at === null) this.at = Math.max(0, names.indexOf(current)); // opens on the one showing
    this.at = Math.min(this.at, names.length - 1);
    return v_flex().id("layout-picker").track_focus(this.handle).w_full().p(14).gap(8).bg(t.popover).text_size(13)
      .on_key_down((e, cx) => {
        const n = names.length;
        if (e.key === "escape") return this.close();
        if (e.key === "enter") return this.go(names[this.at]);
        if (e.key === "down") this.at = (this.at + 1) % n;
        else if (e.key === "up") this.at = (this.at + n - 1) % n;
        else return;
        cx.stop_propagation();
        cx.notify();
      })
      .child(h_flex().items_center()
        .child(div().flex_1().text_size(15).font_semibold().text_color(t.foreground).child("Layouts"))
        .child(div().text_size(11).text_color(t.dim).child("↑↓ Enter · Esc")))
      .child(v_flex().id("lp-list").h(Math.min(240, Math.max(1, names.length) * 32)).overflow_y_scrollbar()
        .when(!names.length, (el) => el.child(div().p(10).text_color(t.dim).child("No layouts found.")))
        .children(names.map((name, i) => h_flex().id(`lp-${i}`).flex_none().h(32).px(10).gap(10).items_center().rounded(7).cursor_pointer()
          .when(i === this.at, (el) => el.bg(t.hover))
          .hover((s) => s.bg(t.hover))
          .on_click(() => this.go(name))
          .child(div().w(12).flex_none().text_color(t.accent).child(name === current ? "●" : ""))
          .child(div().flex_1().truncate().text_color(t.foreground).when(name === current, (d) => d.font_semibold()).child(name))
          .when(name === current, (el) => el.child(div().text_size(11).text_color(t.dim).child("showing"))))));
  }
}
