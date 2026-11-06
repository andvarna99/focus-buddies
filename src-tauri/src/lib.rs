// GNOME ignores always-on-top requests from native Wayland apps but honors them through XWayland.
// This has to happen before GTK starts, and a GDK_BACKEND set by the person still wins.
#[cfg(target_os = "linux")]
fn prefer_xwayland() {
    let is_wayland = std::env::var("XDG_SESSION_TYPE").is_ok_and(|session| session == "wayland");

    if is_wayland && std::env::var_os("GDK_BACKEND").is_none() {
        std::env::set_var("GDK_BACKEND", "x11");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    prefer_xwayland();

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Focus Buddy");
}
