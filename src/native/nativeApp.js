import { Capacitor } from "@capacitor/core";
import "./app-nativo.css";

export const isApp = Capacitor.isNativePlatform();

async function sincronizarBarraDeStatus(StatusBar, Style) {
  const escuro = document.documentElement.getAttribute("data-theme") === "dark";
  try {
    await StatusBar.setStyle({ style: escuro ? Style.Dark : Style.Light });
  } catch {
  }
}

export async function iniciarApp() {
  document.documentElement.classList.add("app-nativo");

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && !/viewport-fit\s*=\s*cover/.test(viewport.content)) {
    viewport.setAttribute("content", `${viewport.content}, viewport-fit=cover`);
  }

  const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/status-bar"),
    import("@capacitor/splash-screen"),
  ]);

  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== "/") window.history.back();
    else App.exitApp();
  });

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: "#00000000" });
  } catch {
  }

  await sincronizarBarraDeStatus(StatusBar, Style);
  new MutationObserver(() => sincronizarBarraDeStatus(StatusBar, Style)).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] },
  );

  await SplashScreen.hide();
}

export async function vibrar() {
  if (!isApp) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  await Haptics.impact({ style: ImpactStyle.Light });
}
